from typing import Dict, List
from loguru import logger
import re
from operator import itemgetter
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda

from .post_parser_chain import PostParserChain
from .allowed_terms_pparser import AllowedTermsPParserChain
from ..configs import (
    MultiRefTaggerChainConfig,
    MultiParserChainConfig,
    ParserChainType,
)
from ..utils import find_json_object
from ..schema.post import RefPost
from ..prompting.jinja.multi_ref.zero_ref_template import zero_ref_template
from ..prompting.jinja.multi_ref.single_ref_template import single_ref_template
from ..prompting.jinja.multi_ref.multi_ref_template import multi_ref_template
from ..prompting.post_renderers import post_renderer_factory
from ..web_extractors.metadata_extractors import (
    RefMetadata,
    get_refs_metadata_portion,
    get_ref_post_metadata_list,
)
from ..postprocessing import ParserChainOutput, Answer, SubAnswer
from ..postprocessing.output_processors import PydanticAnswerParser
from ..schema.ontology_base import OntologyBase
from ..enum_dict import EnumDict, EnumDictKey


class PromptCase(EnumDictKey):
    ZERO_REF = "ZERO_REF"
    SINGLE_REF = "SINGLE_REF"
    MULTI_REF = "MULTI_REF"


def return_fallback(input):
    return ParserChainOutput(
        answer=[],
        pparser_type=ParserChainType.MULTI_REF_TAGGER,
        extra={"errors": "fallback"},
    )


def check_equivalence(string1, string2):
    # Function to remove non-alphabetic characters from a string
    def clean_string(s):
        return re.sub(r"[^a-zA-Z]", "", s)

    # Clean both strings
    cleaned_string1 = clean_string(string1)
    cleaned_string2 = clean_string(string2)

    # Compare cleaned strings
    return cleaned_string1 == cleaned_string2


def normalize_labels(answer: Answer, allowed_terms: List[str]) -> Answer:
    for sub_answer in answer.sub_answers:
        # list of normalized labels
        normalized_labels = []

        for term in allowed_terms:
            for pred_label in sub_answer.final_answer:
                # check if normalized term present in predicted label (eg "endorses" in "<endorses>")
                if check_equivalence(term, pred_label):
                    normalized_labels.append(term)

        # replace raw model labels with normalized labels
        sub_answer.final_answer = normalized_labels

    return answer


def normalize_references(answer: Answer, ref_urls: List[str]) -> Answer:
    """
    Normalize the link between sub-answers and the references they pertain to,
    handle model generation errors.
    Output will be an updated Answer with normalized ref numbers for each SubAnswer.
    Each ref_number will correspond to one of the RefMetadata objects in `md_list`
    If sub_answer.ref_number -> md_list[]
    """
    # handle zero ref case
    if len(ref_urls) == 0:
        # if zero refs, check that exactly one sub answer
        if len(answer.sub_answers) == 1:
            # no reference available
            answer.sub_answers[0].ref_number = -1
        elif len(answer.sub_answers) == 0:
            # create empty subanswer
            answer = Answer(
                sub_answers=[
                    SubAnswer(
                        ref_number=-1,
                        final_answer=[],
                    )
                ],
                debug={
                    "errors": f"len(answer.sub_answers)={len(answer.sub_answers)} \
                    != len(md_list)={len(ref_urls)}",
                    "answer": answer.dict(),  # pydantic v1
                },  # create new answer with error debug info
            )
        else:
            # more than 1 subanswer - take first
            answer = Answer(
                sub_answers=[answer.sub_answers[0]],
                debug={
                    "errors": f"len(answer.sub_answers)={len(answer.sub_answers)} \
                    != len(md_list)={len(ref_urls)}",
                    "answer": answer.dict(),  # pydantic v1
                },  # create new answer with error debug info
            )
            answer.sub_answers[0].ref_number = -1

        assert len(answer.sub_answers) == 1
        assert answer.sub_answers[0].ref_number == -1

    # handle case with refs
    else:
        normalized_sub_answers = []
        sub_ans_dict = {}
        for sub_ans in answer.sub_answers:
            if sub_ans.ref_number not in sub_ans_dict:
                sub_ans_dict[sub_ans.ref_number] = sub_ans
            else:
                logger.warning(
                    f"Multiple sub_answers for same ref number: {sub_ans.ref_number}"
                )

        for i, ref_url in enumerate(ref_urls):
            # look for subanswer with corresponding ref number
            if i + 1 in sub_ans_dict:
                sub_ans = sub_ans_dict[i + 1]
                sub_ans.ref_number = i
                sub_ans.ref_url = ref_url
                normalized_sub_answers.append(sub_ans)
                sub_ans_dict.pop(i + 1)
            else:
                # add empty sub answer
                sub_ans = SubAnswer(
                    ref_number=i,
                    reasoning_steps="[System] Generated output \
                    did not contain answer for this reference.",
                    final_answer=[],
                    ref_url=ref_url,
                )
                normalized_sub_answers.append(sub_ans)

        # check that there are no superfluous subanswers
        if len(sub_ans_dict) > 0:
            logger.warning(
                f"Superfluous sub-answers: {sub_ans_dict.keys()}. Answer={answer.dict()}"
            )

        # sort sub_answers by ascending reference number
        normalized_sub_answers = sorted(
            normalized_sub_answers,
            key=lambda x: x.ref_number,
        )

        assert len(normalized_sub_answers) == len(ref_urls)
        answer.sub_answers = normalized_sub_answers

    return answer


def post_process_llm_chain(input: dict) -> ParserChainOutput:
    answer = input.get("answer_chain")
    allowed_terms = input.get("allowed_terms")
    md_list = input.get("ref_metadata")
    ref_urls = input.get("ref_urls")
    prompt = input.get("prompt")
    output = _post_process_llm_chain(
        answer,
        allowed_terms,
        md_list,
        ref_urls,
        prompt,
    )
    return output


def _post_process_llm_chain(
    answer: Answer,
    allowed_terms: List[str],
    md_list: List[RefMetadata],
    ref_urls: List[str],
    prompt: str,
) -> ParserChainOutput:
    # prepare extra metadata
    extra = {
        "prompt": prompt,
        "md_list": md_list,
        "allowed_terms": allowed_terms,
    }

    # normalize references
    answer = normalize_references(answer, ref_urls)

    # if error, add err msgs to extra data
    if answer.is_err:
        extra["debug"] = answer.debug

    # normalize labels
    answer = normalize_labels(answer, allowed_terms)

    # collect reasoning steps for each subanswer
    reasoning_dict = {}
    for sub_ans in answer.sub_answers:
        reasoning_dict[sub_ans.ref_number] = {
            "steps": sub_ans.reasoning_steps,
            "candidates": sub_ans.candidate_tags,
        }

    output = ParserChainOutput(
        answer=answer,
        reasoning=reasoning_dict,
        pparser_type=ParserChainType.MULTI_REF_TAGGER,
        extra=extra,
    )

    return output


class MultiRefTaggerParserChain(PostParserChain):
    def __init__(
        self,
        parser_config: MultiRefTaggerChainConfig,
        global_config: MultiParserChainConfig,
        ontology: OntologyBase,
    ):
        super().__init__(parser_config, global_config, ontology)

        self.input_prompt = PromptTemplate.from_template(self.input_key)
        self._allowed_terms_name = f"{self.input_name}_allowed_terms"
        self.pydantic_parser = PydanticAnswerParser(pydantic_object=Answer)

        self.runnable_fallback = RunnableLambda(return_fallback)

        # init post renderer
        self.post_renderer = post_renderer_factory(self.parser_config.post_renderer)

        # init chains
        llm_chain = (
            self.input_prompt | self.model | find_json_object | self.pydantic_parser
        )

        self._chain = {
            "answer_chain": llm_chain,
            "allowed_terms": itemgetter(self.allowed_terms_name),
            "ref_metadata": itemgetter("ref_metadata"),
            "ref_urls": itemgetter("ref_urls"),
            "prompt": itemgetter(self.input_name),
        } | RunnableLambda(post_process_llm_chain)

        self.init_prompt_case_dict(ontology)

    @property
    def chain(self):
        return self._chain.with_retry().with_fallbacks([self.runnable_fallback])

    @property
    def allowed_terms_name(self) -> str:
        return self._allowed_terms_name

    def process_ref_post(
        self,
        post: RefPost,
    ) -> ParserChainOutput:
        pass

    def init_prompt_case_dict(self, ontology: OntologyBase):
        # organize information in ontology for quick retrieval by prompter
        prompt_case_dict = EnumDict(PromptCase)

        # configure zero ref case
        prompt_case_dict[PromptCase.ZERO_REF] = {
            "labels": ontology.get_valid_templates(
                subject_type="post", object_type="nan", as_dict=False
            ).label.to_list(),
            "type_templates": ontology.get_valid_templates(
                subject_type="post", object_type="nan"
            ),
        }

        prompt_case_dict[PromptCase.ZERO_REF]["prompt_j2_template"] = zero_ref_template

        # configure single ref case
        prompt_case_dict[PromptCase.SINGLE_REF] = {
            "labels": ontology.get_valid_templates(
                subject_type="post", object_type="ref", as_dict=False
            ).label.to_list(),
            "type_templates": ontology.get_valid_templates(
                subject_type="post", object_type="ref"
            ),
        }

        prompt_case_dict[PromptCase.SINGLE_REF][
            "prompt_j2_template"
        ] = single_ref_template

        # configure multi ref case
        # TODO update to handle relations - meanwhile placeholder based on single refs
        prompt_case_dict[PromptCase.MULTI_REF] = {
            "labels": ontology.get_valid_templates(
                subject_type="post", object_type="ref", as_dict=False
            ).label.to_list(),
            "type_templates": ontology.get_valid_templates(
                subject_type="post", object_type="ref"
            ),
        }

        prompt_case_dict[PromptCase.MULTI_REF][
            "prompt_j2_template"
        ] = multi_ref_template

        self.prompt_case_dict = prompt_case_dict

    def instantiate_prompt(
        self,
        post: RefPost,
        md_dict: Dict[str, RefMetadata],
    ) -> str:
        if self.parser_config.use_metadata:
            # get relevant metadata for post references
            metadata_list = get_ref_post_metadata_list(
                post,
                md_dict,
            )
        else:
            # if metadata not enabled - remove all metadata
            metadata_list = []

        # check how many external references post mentions
        if len(post.ref_urls) == 0:
            case = PromptCase.ZERO_REF

        else:
            # at least one external reference
            if len(post.ref_urls) == 1:
                case = PromptCase.SINGLE_REF
                # if metadata flag is active, retreive metadata

            else:
                case = PromptCase.MULTI_REF
                # TODO finish

        # create prompts
        prompt = self.create_semantics_prompt_by_case(
            post,
            case,
            metadata_list,
        )

        full_prompt = {
            self.input_name: prompt,
            self.allowed_terms_name: self.prompt_case_dict[case]["labels"],
            "ref_metadata": metadata_list,  # TODO this might get overriden by other chains
            "ref_urls": post.ref_urls,
        }

        return full_prompt

    def create_semantics_prompt_by_case(
        self,
        post: RefPost,
        case: PromptCase,
        metadata_list: List[RefMetadata] = None,
    ) -> str:
        """
        Return full prompt for semantics chain, depending on input PromptCase

        Args:
            post (RefPost): input post
            case (PromptCase): input PromptCase
            metadata_list (List[RefMetadata], optional): List of extracted
            references metadata. Defaults to None.

        Returns:
            str: full instantiated prompt
        """
        metadata_list = metadata_list if metadata_list else list()
        prompt_j2_template = self.prompt_case_dict[case]["prompt_j2_template"]
        type_templates = self.prompt_case_dict[case]["type_templates"]

        rendered_post = self.post_renderer.render(
            post,
            metadata_list,
        )

        # instantiate prompt with ref post details
        full_prompt = prompt_j2_template.render(
            type_templates=type_templates,
            rendered_post=rendered_post,
        )

        return full_prompt
