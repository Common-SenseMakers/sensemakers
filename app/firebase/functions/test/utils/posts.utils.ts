import { FetchParams } from '../../src/@shared/types/types.fetch';
import { ParsePostResult } from '../../src/@shared/types/types.parser';
import {
  PlatformPost,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import {
  AppPost,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  GenericThread,
} from '../../src/@shared/types/types.posts';
import { TwitterThread } from '../../src/@shared/types/types.twitter';
import { PLATFORM } from '../../src/@shared/types/types.user';
import { activityEventCreatedHook } from '../../src/activity/activity.created.hook';
import { Services } from '../../src/instances/services';
import { postUpdatedHook } from '../../src/posts/hooks/post.updated.hook';
import { testCredentials } from '../__tests__/test.accounts';

export const getMockPostNew = () => {
  const authorId = 'test-author-id';
  const createdAtMs = Date.now();

  const defaultGeneric: GenericThread = {
    thread: [
      {
        content: 'this is such a cool idea! https://arxiv.org/abs/2312.05230',
      },
    ],
    author: {
      id: '123456',
      name: 'test author',
      platformId: PLATFORM.Twitter,
      username: 'test_author',
    },
  };

  const originalParsed: ParsePostResult =
    last_output as unknown as ParsePostResult;

  const post: AppPostFull = {
    id: 'post-id',
    createdAtMs: createdAtMs,
    authorId: authorId,
    generic: defaultGeneric,
    semantics: last_output.semantics,
    origin: PLATFORM.Twitter,
    parsedStatus: AppPostParsedStatus.PROCESSED,
    parsingStatus: AppPostParsingStatus.IDLE,
    reviewedStatus: AppPostReviewStatus.PENDING,
    republishedStatus: AppPostRepublishedStatus.PENDING,
    originalParsed,
    mirrors: [
      {
        id: 'pp-id',
        platformId: PLATFORM.Twitter,
        publishOrigin: PlatformPostPublishOrigin.FETCHED,
        publishStatus: PlatformPostPublishStatus.PUBLISHED,
        posted: {
          post_id: '123456',
          timestampMs: createdAtMs,
          user_id: '123412341234',
          post: {
            conversation_id: '123456',
            tweets: [],
            id: 'post-id',
            createdAtMs: createdAtMs,
            authorId: authorId,
            content: 'test content',
            semantics: `
                    @prefix ns1: <http://purl.org/spar/cito/> .
                    @prefix schema: <https://schema.org/> .
                    
                    <http://purl.org/nanopub/temp/mynanopub#assertion> 
                      ns1:discusses <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
                      ns1:includesQuotationFrom <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
                      schema:keywords "ExternalSecurity",        "Geopolitics",        "Israel",        "Kissinger",        "PoliticalScience",        "Security" .
                    `,

            origin: PLATFORM.Twitter,
            parsedStatus: AppPostParsedStatus.PROCESSED,
            parsingStatus: AppPostParsingStatus.IDLE,
            reviewedStatus: AppPostReviewStatus.PENDING,
            republishedStatus: AppPostRepublishedStatus.PENDING,
          },
        },
      },
    ],
  };
  return post;
};

const last_output = {
  semantics:
    '@prefix ns1: <http://purl.org/spar/cito/> .\n@prefix ns2: <https://sense-nets.xyz/> .\n@prefix schema: <https://schema.org/> .\n\n<http://purl.org/nanopub/temp/mynanopub#assertion> ns1:disagreesWith <https://arxiv.org/abs/2401.14000> ;\n    schema:keywords "agent-models",\n        "arXiv",\n        "language-models",\n        "machine-reasoning",\n        "social-media",\n        "user-hashtag",\n        "world-models" ;\n    ns2:endorses <https://arxiv.org/abs/2312.05230> .\n\n<https://arxiv.org/abs/2312.05230> ns2:hasZoteroItemType "preprint" .\n\n<https://arxiv.org/abs/2401.14000> ns2:hasZoteroItemType "conferencePaper" .\n\n',
  support: {
    ontology: {
      semantic_predicates: [
        {
          name: 'disagreesWith',
          uri: 'http://purl.org/spar/cito/disagreesWith',
          versions: ['v0'],
          label: 'disagrees',
          display_name: '👎 disagrees-with',
          prompt:
            'this post disputes or expresses disagreement with statements, ideas or conclusions presented in the mentioned reference.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post disputes or expresses disagreement with statements, ideas or conclusions presented in the mentioned reference.',
          prompt_multi_ref:
            'this reference is being disputed by the post. The post expresses disagreement with statements, ideas or conclusions presented in the mentioned reference.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'possibleMissingReference',
          uri: 'https://sense-nets.xyz/possibleMissingReference',
          versions: ['v0'],
          label: 'missing-ref',
          display_name: '⬛ possible-missing-reference',
          prompt:
            'this post seems to be referring to a reference by name but has not explicitly provided a URL link to the reference. For example, a post that discusses a book and mentions it by title, but contains no link to the book.',
          prompt_zero_ref:
            'this post seems to be referring to a reference by name but has not explicitly provided a URL link to the reference. For example, a post that discusses a book and mentions it by title, but contains no link to the book.',
          prompt_single_ref: null,
          prompt_multi_ref: null,
          valid_subject_types: ['post'],
          valid_object_types: ['nan'],
        },
        {
          name: 'reviews',
          uri: 'http://purl.org/spar/cito/reviews',
          versions: ['v0'],
          label: 'review',
          display_name: '🧐 reviews',
          prompt:
            'this post contains a review of another reference, such as a book, article or movie. The review could be positive or negative. A review can be detailed or a simple short endorsement.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post contains a review of another reference, such as a book, article or movie. The review could be positive or negative. A review can be detailed or a simple short endorsement.',
          prompt_multi_ref:
            'the reference is being reviewed by the post. The reference could be a book, article or movie, or other media content. The review could be positive or negative.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'question',
          uri: 'https://schema.org/Question',
          versions: ['v0'],
          label: 'dg-question',
          display_name: ' ❓ discourse-graph/question',
          prompt: 'this post is raising a research question.',
          prompt_zero_ref: 'this post is raising a research question.',
          prompt_single_ref: null,
          prompt_multi_ref: null,
          valid_subject_types: ['post'],
          valid_object_types: ['nan'],
        },
        {
          name: 'announcesResource',
          uri: 'https://sense-nets.xyz/announcesResource',
          versions: ['v0'],
          label: 'announce',
          display_name: '📢 announces',
          prompt:
            'this post contains an announcement of new research. The announcement is likely made by the authors but may be a third party. We use a broad definition of research that includes classic and non-traditional outputs. Classic outputs include papers, datasets or code. Non traditional outputs can include a podcast, blog post, video explainers, etc.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post contains an announcement of new research. The announcement is likely made by the authors but may be a third party. We use a broad definition of research that includes classic and non-traditional outputs. Classic outputs include papers, datasets or code. Non traditional outputs can include a podcast, blog post, video explainers, etc.',
          prompt_multi_ref:
            'the reference is a new research output being announced by the post. The announcement is likely made by the authors but may be a third party. A research output could be a paper, dataset or other type of research that is being announced publicly.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'endorses',
          uri: 'https://sense-nets.xyz/endorses',
          versions: ['v0'],
          label: 'endorses',
          display_name: '➕ endorses',
          prompt:
            'this post endorses the mentioned reference. This label can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post endorses the mentioned reference. This label can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.',
          prompt_multi_ref:
            'the post endorses this reference. This label can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'discusses',
          uri: 'http://purl.org/spar/cito/discusses',
          versions: ['v0'],
          label: 'discussion',
          display_name: '🗣️ discusses',
          prompt:
            'this post discusses how the cited reference relates to other facts or claims. For example, post might discuss how the cited reference informs questions, provides evidence, or supports or opposes claims.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post discusses how the cited reference relates to other facts or claims. For example, post might discuss how the cited reference informs questions, provides evidence, or supports or opposes claims.',
          prompt_multi_ref:
            'this post discusses how the cited reference relates to other facts or claims. For example, post might discuss how the cited reference informs questions, provides evidence, or supports or opposes claims.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'mentionsListeningStatus',
          uri: 'https://sense-nets.xyz/mentionsListeningStatus',
          versions: ['v0'],
          label: 'listening',
          display_name: '🎧 listening-status',
          prompt:
            'this post describes the listening status of the author in relation to a reference, such as a podcast or radio station. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future.',
          prompt_zero_ref:
            'this post describes the listening status of the author in relation to a reference, such as a podcast or radio station. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future.',
          prompt_single_ref:
            'this post describes the listening status of the author in relation to a reference, such as a podcast or radio station. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future.',
          prompt_multi_ref:
            'this post describes the listening status of the author in relation to this reference, such as a podcast or radio station. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'recommends',
          uri: 'https://sense-nets.xyz/recommends',
          versions: ['v0'],
          label: 'recommendation',
          display_name: '👌 recommends',
          prompt:
            'The author is recommending any kind of content: an article, a movie, podcast, book, another post, etc.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'The author is recommending any kind of content: an article, a movie, podcast, book, another post, etc.',
          prompt_multi_ref:
            'The author is recommending the reference, which can be any kind of content: an article, a movie, podcast, book, another post, etc. This tag can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'mentionsCallForPapers',
          uri: 'https://sense-nets.xyz/mentionsCallForPapers',
          versions: ['v1'],
          label: 'call-for-papers',
          display_name: '📜 mentions-call-for-papers',
          prompt:
            'this post contains a call for research papers, for example to a journal, conference or workshop.',
          prompt_zero_ref:
            'this post contains a call for research papers, for example to a journal, conference or workshop.',
          prompt_single_ref:
            'this post contains a call for research papers, for example to a journal, conference or workshop.',
          prompt_multi_ref:
            'this reference contains a call for research papers, for example to a journal, conference or workshop.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'includesQuotationFrom',
          uri: 'http://purl.org/spar/cito/includesQuotationFrom',
          versions: ['v0'],
          label: 'quote',
          display_name: '📝 quotes-from',
          prompt:
            'this post is quoting text from an article it\'s referring to. Symbols like ">" or quotation marks are often used to indicate quotations.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post is quoting text from an article it\'s referring to. Symbols like ">" or quotation marks are often used to indicate quotations.',
          prompt_multi_ref:
            'this reference is being quoted in the post. Symbols like ">" or quotation marks are often used to indicate quotations. ',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'asksQuestionAbout',
          uri: 'https://sense-nets.xyz/asksQuestionAbout',
          versions: ['v0'],
          label: 'question',
          display_name: '❔ ask-question-about',
          prompt:
            "this post is raising a question or questions about some content it's referring to. The content could be a research paper or other media like a podcast, video or blog post.",
          prompt_zero_ref: null,
          prompt_single_ref:
            "this post is raising a question or questions about some content it's referring to. The content could be a research paper or other media like a podcast, video or blog post.",
          prompt_multi_ref:
            'this post is raising a question or questions about the reference. The content could be a research paper or other media like a podcast, video or blog post.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'agreesWith',
          uri: 'http://purl.org/spar/cito/agreesWith',
          versions: ['v0'],
          label: 'agrees',
          display_name: '👍 agrees-with',
          prompt:
            'this post expresses agreement with statements, ideas or conclusions presented in the mentioned reference.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post expresses agreement with statements, ideas or conclusions presented in the mentioned reference.',
          prompt_multi_ref:
            'this post expresses agreement with statements, ideas or conclusions presented in this reference.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'observation',
          uri: 'https://schema.org/Observation',
          versions: ['v0'],
          label: 'dg-observation',
          display_name: '🔭 discourse-graph/observation',
          prompt:
            'this post is articulating a single, highly observation. The intuition is that observation notes should be as close to “the data” as possible. They should be similar to how results are described in results sections of academic publications.',
          prompt_zero_ref:
            'this post is articulating a single, highly observation. The intuition is that observation notes should be as close to “the data” as possible. They should be similar to how results are described in results sections of academic publications.',
          prompt_single_ref: null,
          prompt_multi_ref: null,
          valid_subject_types: ['post'],
          valid_object_types: ['nan'],
        },
        {
          name: 'claim',
          uri: 'https://schema.org/Claim',
          versions: ['v0'],
          label: 'dg-claim',
          display_name: '🫴 discourse-graph/claim',
          prompt: 'this post is articulating an idea or a claim',
          prompt_zero_ref: 'this post is articulating an idea or a claim',
          prompt_single_ref: null,
          prompt_multi_ref: null,
          valid_subject_types: ['post'],
          valid_object_types: ['nan'],
        },
        {
          name: 'summarizes',
          uri: 'https://sense-nets.xyz/summarizes',
          versions: ['v0'],
          label: 'summarizes',
          display_name: '🗜️ summarizes',
          prompt:
            'this post contains a summary of the mentioned reference. The summary is likely provided by the authors but may be a third party.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post contains a summary of the mentioned reference. The summary is likely provided by the authors but may be a third party.',
          prompt_multi_ref:
            'this reference is summarized by the post. The summary is likely provided by the authors but may be a third party.',
          valid_subject_types: [],
          valid_object_types: [],
        },
        {
          name: 'mentionsFundingOpportunity',
          uri: 'https://sense-nets.xyz/mentionsFundingOpportunity',
          versions: ['v1'],
          label: 'funding',
          display_name: '🏦 mentions-funding',
          prompt:
            'this post mentions a funding opportunity, for example a research grant or prize.',
          prompt_zero_ref:
            'this post mentions a funding opportunity, for example a research grant or prize.',
          prompt_single_ref:
            'this post mentions a funding opportunity, for example a research grant or prize.',
          prompt_multi_ref:
            'this reference contains a funding opportunity, for example a research grant or prize.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'mentionsWatchingStatus',
          uri: 'https://sense-nets.xyz/mentionsWatchingStatus',
          versions: ['v0'],
          label: 'watching',
          display_name: '📺 watching-status',
          prompt:
            'this post describes the watching status of the author in relation to a reference, such as a video or movie. The author may have watched the content in the past, is watching the content in the present, or is looking forward to watching the content in the future.',
          prompt_zero_ref:
            'this post describes the watching status of the author in relation to a reference, such as a video or movie. The author may have watched the content in the past, is watching the content in the present, or is looking forward to watching the content in the future.',
          prompt_single_ref:
            'this post describes the watching status of the author in relation to a reference, such as a video or movie. The author may have watched the content in the past, is watching the content in the present, or is looking forward to watching the content in the future.',
          prompt_multi_ref:
            'this post describes the watching status of the author in relation to this reference, such as a video or movie. The author may have watched the content in the past, is watching the content in the present, or is looking forward to watching the content in the future.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'mentionsReadingStatus',
          uri: 'https://sense-nets.xyz/mentionsReadingStatus',
          versions: ['v0'],
          label: 'reading',
          display_name: '📑 reading-status',
          prompt:
            'this post describes the reading status of the author in relation to a reference, such as a book or article. The author may either have read the reference in the past, is reading the reference in the present, or is looking forward to reading the reference in the future.',
          prompt_zero_ref:
            'this post describes the reading status of the author in relation to a reference, such as a book or article. The author may either have read the reference in the past, is reading the reference in the present, or is looking forward to reading the reference in the future.',
          prompt_single_ref:
            'this post describes the reading status of the author in relation to a reference, such as a book or article. The author may either have read the reference in the past, is reading the reference in the present, or is looking forward to reading the reference in the future.',
          prompt_multi_ref:
            'this post describes the reading status of the author in relation to this reference, which could be a book, article or other written media. The author may either have read the reference in the past, is reading the reference in the present, or is looking forward to reading the reference in the future.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'announcesEvent',
          uri: 'https://sense-nets.xyz/announcesEvent',
          versions: ['v0'],
          label: 'event',
          display_name: '🗓️ announces-event',
          prompt:
            'this post includes an invitation to an event, either a real-world or an online event. Any kind of event is relevant, some examples of such events could be seminars, meetups, or hackathons. This tag should only be used for invitations to events, not for posts describing other kinds of events.',
          prompt_zero_ref:
            'this post includes an invitation to an event, either a real-world or an online event. Any kind of event is relevant, some examples of such events could be seminars, meetups, or hackathons. This tag should only be used for invitations to events, not for posts describing other kinds of events.',
          prompt_single_ref:
            'this post includes an invitation to an event, either a real-world or an online event. Any kind of event is relevant, some examples of such events could be seminars, meetups, or hackathons. This tag should only be used for invitations to events, not for posts describing other kinds of events.',
          prompt_multi_ref:
            'the reference is an invitation to an event, either a real-world or an online event. Any kind of event is relevant, some examples of such events could be seminars, meetups, or hackathons. This tag shold only be used for invitations to events, not for posts describing other kinds of events.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'announcesJob',
          uri: 'https://sense-nets.xyz/announcesJob',
          versions: ['v0'],
          label: 'job',
          display_name: '📢 announces-job',
          prompt:
            'this post describes a job listing, for example a call for graduate students or faculty applications.',
          prompt_zero_ref:
            'this post describes a job listing, for example a call for graduate students or faculty applications.',
          prompt_single_ref:
            'this post describes a job listing, for example a call for graduate students or faculty applications.',
          prompt_multi_ref:
            'the reference is a job listing, for example a call for graduate students or faculty applications.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'indicatesInterest',
          uri: 'https://sense-nets.xyz/indicatesInterest',
          versions: ['v1'],
          label: 'indicates-interest',
          display_name: '👀 indicates-interest',
          prompt:
            'this post indicates interest in a reference. This label is meant for cases where the post is not explicitly recommending or endorsing the cited reference.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post indicates interest in a reference. This label is meant for cases where the post is not explicitly recommending or endorsing the cited reference.',
          prompt_multi_ref:
            'the post is indicating interest in this reference. This label is meant for cases where the post is not explicitly recommending or endorsing this reference.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref'],
        },
        {
          name: 'linksTo',
          uri: 'http://purl.org/spar/cito/linksTo',
          versions: ['v0'],
          label: 'default',
          display_name: '🔗 links-to',
          prompt:
            'This is a special tag. Use this tag if none of the tags above are suitable. If you tag a post with <default>, no other tag should be assigned to the post.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'This is a special tag. Use this tag if none of the tags above are suitable. If you tag a post with <default>, no other tag should be assigned to the post.',
          prompt_multi_ref:
            'This is a special tag. Use this tag if none of the other tags are suitable to characterize this reference.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref'],
        },
      ],
      keyword_predicate: {
        name: 'hasKeyword',
        uri: 'https://schema.org/keywords',
        versions: ['v0'],
      },
      topics_predicate: {
        name: 'hasTopic',
        uri: 'https://schema.org/about',
        versions: ['v0'],
      },
      allowed_topics: [
        'technology',
        'science',
        'academia',
        'research',
        'design',
        'climate',
        'sustainability',
        'software & hardware',
        'philosophy',
        'health',
        'culture',
        'economics',
        'business',
        'politics',
        'news',
        'finance',
        'sports',
        'entertainment & leisure',
        'art',
        'literature',
        'travel',
        'personal',
        'humour',
        'other',
      ],
      ontology_config: {
        db_id: '50c9352aa26b442994148b3cd7cccfcc',
        versions: ['v0', 'v1'],
      },
    },
    refs_meta: {
      'https://arxiv.org/abs/2312.05230': {
        citoid_url: 'http://arxiv.org/abs/2312.05230',
        url: 'https://arxiv.org/abs/2312.05230',
        item_type: 'preprint',
        title:
          'Language Models, Agent Models, and World Models: The LAW for Machine Reasoning and Planning',
        summary:
          'Despite their tremendous success in many applications, large language models often fall short of consistent reasoning and planning in various (language, embodied, and social) scenarios, due to inherent limitations in their inference, learning, and modeling capabilities. In this position paper, we present a new perspective of machine reasoning, LAW, that connects the concepts of Language models, Agent models, and World models, for more robust and versatile reasoning capabilities. In particular, w',
        image: '',
        debug: { error: null },
      },
      'https://arxiv.org/abs/2401.14000': {
        citoid_url: 'http://arxiv.org/abs/2401.14000',
        url: 'https://arxiv.org/abs/2401.14000',
        item_type: 'conferencePaper',
        title:
          'Mapping the Design Space of Teachable Social Media Feed Experiences',
        summary:
          "Social media feeds are deeply personal spaces that reflect individual values and preferences. However, top-down, platform-wide content algorithms can reduce users' sense of agency and fail to account for nuanced experiences and values. Drawing on the paradigm of interactive machine teaching (IMT), an interaction framework for non-expert algorithmic adaptation, we map out a design space for teachable social media feed experiences to empower agential, personalized feed curation. To do so, we condu",
        image: '',
        debug: { error: null },
      },
    },
  },
  filter_classification: 'citoid_detected_research',
  metadata: {
    model_debug: {
      multi_reference_tagger: {
        prompt:
          '\nYou are an expert annotator tasked with converting social media posts about scientific research to a structured semantic format. The post contains external references in the form of links (URLs). Your job is to select, for each reference, the tags best characterizing the relation of the post to the reference.\n\n# Instructions\n## Tag types\nThe tags are to be selected from a predefined set of tags. The available tag types are:\n<disagrees>: this reference is being disputed by the post. The post expresses disagreement with statements, ideas or conclusions presented in the mentioned reference.\n<review>: the reference is being reviewed by the post. The reference could be a book, article or movie, or other media content. The review could be positive or negative.\n<announce>: the reference is a new research output being announced by the post. The announcement is likely made by the authors but may be a third party. A research output could be a paper, dataset or other type of research that is being announced publicly.\n<endorses>: the post endorses this reference. This label can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.\n<discussion>: this post discusses how the cited reference relates to other facts or claims. For example, post might discuss how the cited reference informs questions, provides evidence, or supports or opposes claims.\n<listening>: this post describes the listening status of the author in relation to this reference, such as a podcast or radio station. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future.\n<recommendation>: The author is recommending the reference, which can be any kind of content: an article, a movie, podcast, book, another post, etc. This tag can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.\n<call-for-papers>: this reference contains a call for research papers, for example to a journal, conference or workshop.\n<quote>: this reference is being quoted in the post. Symbols like ">" or quotation marks are often used to indicate quotations. \n<question>: this post is raising a question or questions about the reference. The content could be a research paper or other media like a podcast, video or blog post.\n<agrees>: this post expresses agreement with statements, ideas or conclusions presented in this reference.\n<funding>: this reference contains a funding opportunity, for example a research grant or prize.\n<watching>: this post describes the watching status of the author in relation to this reference, such as a video or movie. The author may have watched the content in the past, is watching the content in the present, or is looking forward to watching the content in the future.\n<reading>: this post describes the reading status of the author in relation to this reference, which could be a book, article or other written media. The author may either have read the reference in the past, is reading the reference in the present, or is looking forward to reading the reference in the future.\n<event>: the reference is an invitation to an event, either a real-world or an online event. Any kind of event is relevant, some examples of such events could be seminars, meetups, or hackathons. This tag shold only be used for invitations to events, not for posts describing other kinds of events.\n<job>: the reference is a job listing, for example a call for graduate students or faculty applications.\n<indicates-interest>: the post is indicating interest in this reference. This label is meant for cases where the post is not explicitly recommending or endorsing this reference.\n<default>: This is a special tag. Use this tag if none of the other tags are suitable to characterize this reference.\n\nA user will pass in a post, and you should reason step by step, before selecting a set of tags for each reference that best that reference\'s relation with the post.\n\n## Reference metadata\nEach reference will be marked by <ref_n> for convenient identification, where n is a number denoting the order of appearance in the post. The first reference will be <ref_1>, the second <ref_2>, etc. Additional metadata may also be provided for references, such as the author name, content type, and summary.\n\n### Quote posts\nQuote posts are a special kind of reference, where the post quotes another post. In which case, the quoted post content will be enclosed by <quote ref_n> (quote content) </quote>. Note that quote content may itself contain references.\n\n\n## Required output format\nYour final answer should be structured as a JSON Answer object with a list of SubAnswer objects, as described by the following schemas:\n\n\n```\nclass SubAnswer:\n\tref_number: int # ID number of current reference\n\treasoning_steps: str # your reasoning steps\n\tcandidate_tags: str # For potential each tag you choose, explain why you chose it.\n\tfinal_answer: List[str] # a set of final tags, based on the Candidate Tags. The final tags must be included in the Candidate Tags list!\n\nclass Answer:\n  sub_answers: List[SubAnswer]\n```\n\n\nFor example, for a post with 2 references, the output would be structured as follows:\n\n```\n{\n  "sub_answers": [\n  {\n    "ref_number": 1,\n    "reasoning_steps": "<your reasoning steps...>",\n    "candidate_tags": "[<tag1>, <tag2>]",\n    "final_answer": [\n      "<tag1>"\n    ]\n  },\n  {\n    "ref_number": 2,\n    "reasoning_steps": "<your reasoning steps...>",\n    "candidate_tags": "[<tag1>, <tag3>, <tag4>]",\n    "final_answer": [\n      "<tag3>",\n      "<tag4>"\n    ]\n  }\n]\n}\n```\n\n\n# Input post text:\n\n- Author: John Doe\n- Content: This is an interesting paper <ref_1> but I disagree with its sequel <ref_2>  #user-hashtag\n- References: \n<ref_1> \nurl: https://arxiv.org/abs/2312.05230\nitem_type: preprint\ntitle: Language Models, Agent Models, and World Models: The LAW for Machine Reasoning and Planning\nsummary: Despite their tremendous success in many applications, large language models often fall short of consistent reasoning and planning in various (language, embodied, and social) scenarios, due to inherent limitations in their inference, learning, and modeling capabilities. In this position paper, we present a new perspective of machine reasoning, LAW, that connects the concepts of Language models, Agent models, and World models, for more robust and versatile reasoning capabilities. In particular, w\n==========\n<ref_2> \nurl: https://arxiv.org/abs/2401.14000\nitem_type: conferencePaper\ntitle: Mapping the Design Space of Teachable Social Media Feed Experiences\nsummary: Social media feeds are deeply personal spaces that reflect individual values and preferences. However, top-down, platform-wide content algorithms can reduce users\' sense of agency and fail to account for nuanced experiences and values. Drawing on the paradigm of interactive machine teaching (IMT), an interaction framework for non-expert algorithmic adaptation, we map out a design space for teachable social media feed experiences to empower agential, personalized feed curation. To do so, we condu\n==========\n\n\n# Output:\n\n',
        md_list: [
          {
            citoid_url: 'http://arxiv.org/abs/2312.05230',
            url: 'https://arxiv.org/abs/2312.05230',
            item_type: 'preprint',
            title:
              'Language Models, Agent Models, and World Models: The LAW for Machine Reasoning and Planning',
            summary:
              'Despite their tremendous success in many applications, large language models often fall short of consistent reasoning and planning in various (language, embodied, and social) scenarios, due to inherent limitations in their inference, learning, and modeling capabilities. In this position paper, we present a new perspective of machine reasoning, LAW, that connects the concepts of Language models, Agent models, and World models, for more robust and versatile reasoning capabilities. In particular, w',
            image: '',
            debug: { error: null },
          },
          {
            citoid_url: 'http://arxiv.org/abs/2401.14000',
            url: 'https://arxiv.org/abs/2401.14000',
            item_type: 'conferencePaper',
            title:
              'Mapping the Design Space of Teachable Social Media Feed Experiences',
            summary:
              "Social media feeds are deeply personal spaces that reflect individual values and preferences. However, top-down, platform-wide content algorithms can reduce users' sense of agency and fail to account for nuanced experiences and values. Drawing on the paradigm of interactive machine teaching (IMT), an interaction framework for non-expert algorithmic adaptation, we map out a design space for teachable social media feed experiences to empower agential, personalized feed curation. To do so, we condu",
            image: '',
            debug: { error: null },
          },
        ],
        allowed_terms: [
          'disagrees',
          'review',
          'announce',
          'endorses',
          'discussion',
          'listening',
          'recommendation',
          'call-for-papers',
          'quote',
          'question',
          'agrees',
          'funding',
          'watching',
          'reading',
          'event',
          'job',
          'indicates-interest',
          'default',
        ],
        debug: {},
        reasoning: {
          '0': {
            steps:
              'The post describes the paper as interesting, indicating some level of endorsement or positive sentiment towards it.',
            candidates: '[<endorses>, <recommendation>]',
          },
          '1': {
            steps:
              'The post explicitly states disagreement with the content of this reference.',
            candidates: '[<disagrees>]',
          },
        },
      },
      topics: {
        allowed_tags: [
          'technology',
          'science',
          'academia',
          'research',
          'design',
          'climate',
          'sustainability',
          'software & hardware',
          'philosophy',
          'health',
          'culture',
          'economics',
          'business',
          'politics',
          'news',
          'finance',
          'sports',
          'entertainment & leisure',
          'art',
          'literature',
          'travel',
          'personal',
          'humour',
          'other',
        ],
        full_text:
          "Reasoning Steps:\n1. The post mentions two different papers from arXiv, which are related to machine reasoning, language models, agent models, and social media feed experiences.\n2. The post expresses disagreement with the second paper mentioned.\n3. The content of the papers involves discussions on machine reasoning, language models, social media algorithms, and personalized experiences.\n\nCandidate Topics:\n- academia: The post references academic papers from arXiv, indicating a discussion related to academic research.\n- research: The content of the papers involves research on machine reasoning, language models, and social media algorithms.\n- technology: The papers discuss machine reasoning, language models, and social media algorithms, all related to technology.\n\nFinal Answer:\n- academia\n- research\n- technology \n\n ##Allowed terms: ['technology', 'science', 'academia', 'research', 'design', 'climate', 'sustainability', 'software & hardware', 'philosophy', 'health', 'culture', 'economics', 'business', 'politics', 'news', 'finance', 'sports', 'entertainment & leisure', 'art', 'literature', 'travel', 'personal', 'humour', 'other']",
        prompt:
          "\nYou are an expert annotator tasked with assigning topics to social media posts. The assigned topics should represent the most salient topics discussed by the post.  \n\nThe available topic types are:\n- technology\n- science\n- academia\n- research\n- design\n- climate\n- sustainability\n- software & hardware\n- philosophy\n- health\n- culture\n- economics\n- business\n- politics\n- news\n- finance\n- sports\n- entertainment & leisure\n- art\n- literature\n- travel\n- personal\n- humour\n- other\n\nA user will pass in a post, and you should think step by step, before selecting a set of topics that best match the post. You must only use the topics in the list!\n\n\nRules:\n- Your final answer should be structured as follows:\n    - Reasoning Steps: (your reasoning steps)\n    - Candidate Topics: (For potential each topic you choose, explain why you chose it.)\n    - Final Answer: (a set of final topics, based on the Candidate Topics. The rest of the final keywords must be included in the Candidate Topics list!)\n\n\n# Input post text:\n\n- Content: This is an interesting paper https://arxiv.org/abs/2312.05230 but I disagree with its sequel https://arxiv.org/abs/2401.14000  #user-hashtag\n- References:\n1: https://arxiv.org/abs/2312.05230\nItem type: preprint\nTitle: Language Models, Agent Models, and World Models: The LAW for Machine Reasoning and Planning\nSummary: Despite their tremendous success in many applications, large language models often fall short of consistent reasoning and planning in various (language, embodied, and social) scenarios, due to inherent limitations in their inference, learning, and modeling capabilities. In this position paper, we present a new perspective of machine reasoning, LAW, that connects the concepts of Language models, Agent models, and World models, for more robust and versatile reasoning capabilities. In particular, w\n------------------\n2: https://arxiv.org/abs/2401.14000\nItem type: conferencePaper\nTitle: Mapping the Design Space of Teachable Social Media Feed Experiences\nSummary: Social media feeds are deeply personal spaces that reflect individual values and preferences. However, top-down, platform-wide content algorithms can reduce users' sense of agency and fail to account for nuanced experiences and values. Drawing on the paradigm of interactive machine teaching (IMT), an interaction framework for non-expert algorithmic adaptation, we map out a design space for teachable social media feed experiences to empower agential, personalized feed curation. To do so, we condu\n------------------\n\n\n# Output:",
        reasoning:
          '[Reasoning Steps]\n\n1. The post mentions two different papers from arXiv, which are related to machine reasoning, language models, agent models, and social media feed experiences.\n2. The post expresses disagreement with the second paper mentioned.\n3. The content of the papers involves discussions on machine reasoning, language models, social media algorithms, and personalized experiences.\n\n[Candidate Tags]\n\n- academia: The post references academic papers from arXiv, indicating a discussion related to academic research.\n- research: The content of the papers involves research on machine reasoning, language models, and social media algorithms.\n- technology: The papers discuss machine reasoning, language models, and social media algorithms, all related to technology.',
      },
      keywords: {
        raw_text:
          'Reasoning Steps:\n1. The post mentions two academic papers from arXiv, indicating a discussion related to academic research.\n2. The first paper discusses machine reasoning and planning using language models, agent models, and world models.\n3. The second paper explores the design space of teachable social media feed experiences.\n\nCandidate Keywords:\n1. #arXiv - Both papers are from arXiv, indicating an academic source.\n2. #machine-reasoning - Mentioned in the first paper title and summary.\n3. #social-media - Mentioned in the second paper title and summary.\n4. #language-models - Referenced in the first paper title and summary.\n5. #agent-models - Referenced in the first paper title and summary.\n6. #world-models - Referenced in the first paper title and summary.\n\nFinal Answer:\n1. #arXiv - Indicates academic source.\n2. #machine-reasoning - Specific to the discussion in the first paper.\n3. #social-media - Specific to the discussion in the second paper.\n4. #language-models - Specific to the discussion in the first paper.\n5. #agent-models - Specific to the discussion in the first paper.\n6. #world-models - Specific to the discussion in the first paper.\n7. #academic - Indicates the post is related to academic research.',
        prompt:
          '\nYou are an expert annotator tasked with assigning keywords to social media posts. The keywords should represent the most salient topics discussed by the post. The keywords should consist of two types: general and specific. The general keywords should indicate the general topics discussed by the posts and its references, like "#AI" or "#blockchain". The specific keywords should highlight specific that will help people in the field better understand the post\'s contents (like "#monte-carlo-tree-search", or "#consensus-algorithms"). In addition to the above, you should also add a special \'#academic\' keyword if the post is related to academic research. Acaedmic research is to be defined broadly, as anything that the author is likely to see as related to their research, including academic job offers, code repositories, blog posts and so on. If the post is clearly not related in any way to academic research, add \'#not-academic\'. \n\nRules:\n- You should choose up to 6 keywords, plus the additional special academic/non-academic keyword!\n- Keywords should be prefixed with a hashtag, e.g., #AI\n- Your final answer should be structured as follows:\n    - Reasoning Steps: (your reasoning steps)\n    - Candidate Keywords: (For potential each keyword you choose, explain why you chose it.)\n    - Final Answer: (a set of 7 final keywords, based on the Candidate Keywords. One of the keywords should be #academic or #not-academic. The rest of the final keywords must be included in the Candidate Keywords list!)\n\n\n# Input post text:\n\n- Content: This is an interesting paper https://arxiv.org/abs/2312.05230 but I disagree with its sequel https://arxiv.org/abs/2401.14000  #user-hashtag\n- References:\n1: https://arxiv.org/abs/2312.05230\nItem type: preprint\nTitle: Language Models, Agent Models, and World Models: The LAW for Machine Reasoning and Planning\nSummary: Despite their tremendous success in many applications, large language models often fall short of consistent reasoning and planning in various (language, embodied, and social) scenarios, due to inherent limitations in their inference, learning, and modeling capabilities. In this position paper, we present a new perspective of machine reasoning, LAW, that connects the concepts of Language models, Agent models, and World models, for more robust and versatile reasoning capabilities. In particular, w\n------------------\n2: https://arxiv.org/abs/2401.14000\nItem type: conferencePaper\nTitle: Mapping the Design Space of Teachable Social Media Feed Experiences\nSummary: Social media feeds are deeply personal spaces that reflect individual values and preferences. However, top-down, platform-wide content algorithms can reduce users\' sense of agency and fail to account for nuanced experiences and values. Drawing on the paradigm of interactive machine teaching (IMT), an interaction framework for non-expert algorithmic adaptation, we map out a design space for teachable social media feed experiences to empower agential, personalized feed curation. To do so, we condu\n------------------\n\n\n# Output:',
        reasoning:
          '[Reasoning Steps]\n\n1. The post mentions two academic papers from arXiv, indicating a discussion related to academic research.\n2. The first paper discusses machine reasoning and planning using language models, agent models, and world models.\n3. The second paper explores the design space of teachable social media feed experiences.\n\n[Candidate Keywords]\n\n1. #arXiv - Both papers are from arXiv, indicating an academic source.\n2. #machine-reasoning - Mentioned in the first paper title and summary.\n3. #social-media - Mentioned in the second paper title and summary.\n4. #language-models - Referenced in the first paper title and summary.\n5. #agent-models - Referenced in the first paper title and summary.\n6. #world-models - Referenced in the first paper title and summary.',
      },
      hashtags: {
        prompt:
          'This is an interesting paper https://arxiv.org/abs/2312.05230 but I disagree with its sequel https://arxiv.org/abs/2401.14000  #user-hashtag',
        reasoning: null,
      },
    },
  },
};

export const getMockPost = (refPost: Partial<AppPostFull>) => {
  const authorId = refPost.authorId || 'test-author-id';
  const createdAtMs = refPost.createdAtMs || Date.now();

  const defaultGeneric: GenericThread = {
    thread: [
      {
        content: 'test content',
      },
    ],
    author: {
      id: '123456',
      name: 'test author',
      platformId: PLATFORM.Twitter,
      username: 'test_author',
    },
  };

  const twitterMirror: PlatformPost<TwitterThread> = {
    id: 'pp-id',
    platformId: PLATFORM.Twitter,
    publishOrigin: PlatformPostPublishOrigin.FETCHED,
    publishStatus: PlatformPostPublishStatus.PUBLISHED,
    posted: {
      post_id: '123456',
      timestampMs: createdAtMs,
      user_id: testCredentials[0].twitter.id,
      post: {
        conversation_id: '123456',
        tweets: [
          {
            id: '123456',
            created_at: '2021-01-01T00:00:00.000Z',
            author_id: '123456',
            conversation_id: '123456',
            text: 'test content',
          },
        ],
        author: {
          id: '123456',
          username: 'test_author',
          name: 'test author',
        },
      },
    },
  };

  const post: AppPostFull = {
    id: refPost.id || 'post-id',
    createdAtMs: createdAtMs,
    authorId: authorId,
    generic: refPost.generic || defaultGeneric,
    semantics: refPost.semantics || '',
    origin: PLATFORM.Twitter,
    parsedStatus: AppPostParsedStatus.PROCESSED,
    parsingStatus: AppPostParsingStatus.IDLE,
    reviewedStatus: AppPostReviewStatus.PENDING,
    republishedStatus: AppPostRepublishedStatus.PENDING,
    mirrors: refPost.mirrors
      ? [...refPost.mirrors, twitterMirror]
      : [twitterMirror],
  };
  return post;
};

/**
 * We need to manually call the postUpdate hook that would have been called
 * when creating the AppPost as part of the fetch
 */
export const fetchPostsInTests = async (
  userId: string,
  params: FetchParams,
  services: Services
) => {
  /** fetch will store the posts in the DB */
  const postsCreated = await services.postsManager.fetchUser({
    userId: userId,
    params,
  });

  /**
   * We need to manually call the postUpdate hook that would have been called
   * when creating the AppPost as part of the fetch
   */
  await Promise.all(
    postsCreated.map((postCreated) =>
      postUpdatedHook(postCreated.post, services)
    )
  );
};

// auto triggfe the acivity create hook
export const postUpdatedHookOnTest = async (
  post: AppPost,
  services: Services,
  before?: AppPost
) => {
  const activities = await postUpdatedHook(post, services, before);

  await Promise.all(
    activities.map((activity) => activityEventCreatedHook(activity, services))
  );
};
