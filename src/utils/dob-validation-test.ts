// Test the DOB validation logic
// This would be used for unit tests

export const validateDateOfBirth = (dobString: string): { valid: boolean; error?: string } => {
    // Validate the date format and ensure it's a valid date
    const dobDate = new Date(dobString);
    if (isNaN(dobDate.getTime())) {
        return { valid: false, error: "Invalid date format for date of birth" };
    }

    // Ensure the date is not in the future
    if (dobDate > new Date()) {
        return { valid: false, error: "Date of birth cannot be in the future" };
    }

    // Ensure the person is at least 16 years old
    const sixteenYearsAgo = new Date();
    sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);
    if (dobDate > sixteenYearsAgo) {
        return { valid: false, error: "You must be at least 16 years old to use this platform" };
    }

    return { valid: true };
};

// Test cases for DOB validation
export const testCases = [
    {
        input: "1990-01-15",
        expected: { valid: true },
        description: "Valid adult birth date"
    },
    {
        input: "2025-01-01",
        expected: { valid: false, error: "Date of birth cannot be in the future" },
        description: "Future date should be rejected"
    },
    {
        input: "2020-01-01",
        expected: { valid: false, error: "You must be at least 16 years old to use this platform" },
        description: "Too young (under 16)"
    },
    {
        input: "2007-01-01",
        expected: { valid: true },
        description: "Valid teen birth date (17 years old)"
    },
    {
        input: "invalid-date",
        expected: { valid: false, error: "Invalid date format for date of birth" },
        description: "Invalid date format"
    }
];

// Console test runner
export const runTests = () => {
    console.log("Running DOB Validation Tests...\n");

    testCases.forEach((test, index) => {
        const result = validateDateOfBirth(test.input);
        const passed = JSON.stringify(result) === JSON.stringify(test.expected);

        console.log(`Test ${index + 1}: ${test.description}`);
        console.log(`Input: ${test.input}`);
        console.log(`Expected: ${JSON.stringify(test.expected)}`);
        console.log(`Actual: ${JSON.stringify(result)}`);
        console.log(`Result: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
    });
};

// Example usage:
// import { runTests } from './dob-validation-test';
// runTests();
