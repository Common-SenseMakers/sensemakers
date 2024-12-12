import pytest
from typing import List
import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

# Import the normalize_keywords function
from desci_sense.shared_functions.postprocessing.output_processors import normalize_keywords  # Adjust the path as needed

def test_normalize_keywords():
    # Define test cases: input list and expected normalized output
    test_cases = [
        {
            "input": ["Model Theory", "AI", "A.I.", "crypto_currency", "   Model Theory   "],
            "expected": ["model-theory", "ai", "ai", "crypto-currency", "model-theory"],
        },
        {
            "input": ["MODEL_THEORY", "Model@Theory#", "block_chain technology"],
            "expected": ["model-theory", "model-theory", "block-chain-technology"],
        },
        {
            "input": ["AI_", "_AI_", "A.....I"],
            "expected": ["ai", "ai", "ai"],
        },
        {
            "input": ["Model----Theory", "Model____Theory"],
            "expected": ["model-theory", "model-theory"],
        }
    ]

    # Run the test cases
    for case in test_cases:
        input_keywords = case["input"]
        expected_output = case["expected"]
        assert normalize_keywords(input_keywords) == expected_output, f"Failed for input: {input_keywords}"

# Main entry point for standalone execution
if __name__ == "__main__":
    pytest.main([__file__])
