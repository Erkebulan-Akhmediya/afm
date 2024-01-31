export type HashMap<T extends number | string, M> = {
    [details in T]: M;
};

export default function countResult(arr: number[]): string {
    const correctAnswers: HashMap<number, HashMap<string, string[]>> = {
        // question number, factor, correct answers
        3: { 'A': ['a', 'b'] },
        4: { 'C': ['a', 'b'] },
        5: { 'C': ['b', 'c'] },
        6: { 'E': ['b', 'c'] },
        7: { 'E': ['a', 'b'] },
        8: { 'F': ['b', 'c'] },
        9: { 'G': ['b', 'c'] },
        10: { 'H': ['a', 'b'] },
        11: { 'I': ['b', 'c'] },
        12: { 'I': ['a', 'b'] },
        13: { 'L': ['b', 'c'] },
        14: { 'M': ['b', 'c'] },
        15: { 'M': ['b', 'c'] },
        16: { 'N': ['b', 'c'] },
        17: { 'N': ['a', 'b'] },
        18: { 'O': ['a', 'b'] },
        19: { 'O': ['b', 'c'] },
        20: { 'Q1': ['a', 'b'] },
        21: { 'Q1': ['b', 'c'] },
        22: { 'Q2': ['b', 'c'] },
        23: { 'Q3': ['b', 'c'] },
        24: { 'Q3': ['b', 'c'] },
        25: { 'Q4': ['b', 'c'] },
        26: { 'A': ['b', 'c'] },
        27: { 'A': ['b', 'c'] },
        28: { 'B': ['b'] },
        29: { 'C': ['b', 'c'] },
        30: { 'C': ['a', 'b'] },
        31: { 'E': ['b', 'c'] },
        32: { 'E': ['b', 'c'] },
        33: { 'F': ['a', 'b'] },
        34: { 'G': ['b', 'c'] },
        35: { 'H': ['b', 'c'] },
        36: { 'H': ['a', 'b'] },
        37: { 'I': ['a', 'b'] },
        38: { 'L': ['a', 'b'] },
        39: { 'M': ['a', 'b'] },
        40: { 'M': ['a', 'b'] },
        41: { 'N': ['b', 'c'] },
        42: { 'N': ['a', 'b'] },
        43: { 'O': ['a', 'b'] },
        44: { 'O': ['b', 'c'] },
        45: { 'Q1': ['b', 'c'] },
        46: { 'Q1': ['a', 'b'] },
        47: { 'Q2': ['a', 'b'] },
        48: { 'Q3': ['a', 'b'] },
        49: { 'Q4': ['a', 'b'] },
        50: { 'Q4': ['a', 'b'] },
        51: { 'A': ['b', 'c'] },
        52: { 'A': ['b', 'c'] },
        53: { 'B': ['b'] },
        54: { 'B': ['b'] },
        55: { 'C': ['a', 'b'] },
        56: { 'E': ['a', 'b'] },
        57: { 'E': ['b', 'c'] },
        58: { 'F': ['a', 'b'] },
        59: { 'G': ['b', 'c'] },
        60: { 'H': ['b', 'c'] },
        61: { 'H': ['b', 'c'] },
        62: { 'I': ['b', 'c'] },
        63: { 'L': ['b', 'c'] },
        64: { 'L': ['b', 'c'] },
        65: { 'M': ['a', 'b'] },
        66: { 'N': ['b', 'c'] },
        67: { 'N': ['b', 'c'] },
        68: { 'O': ['b', 'c'] },
        69: { 'O': ['a', 'b'] },
        70: { 'Q1': ['a', 'b'] },
        71: { 'Q2': ['a', 'b'] },
        72: { 'Q2': ['a', 'b'] },
        73: { 'Q3': ['a', 'b'] },
        74: { 'Q4': ['a', 'b'] },
        75: { 'Q4': ['b', 'c'] },
        76: { 'A': ['b', 'c'] },
        77: { 'B': ['c'] },
        78: { 'B': ['b'] },
        79: { 'C': ['b', 'c'] },
        80: { 'C': ['b', 'c'] },
        81: { 'E': ['b', 'c'] },
        82: { 'F': ['b', 'c'] },
        83: { 'F': ['a', 'b'] },
        84: { 'G': ['b', 'c'] },
        85: { 'H': ['b', 'c'] },
        86: { 'H': ['b', 'c'] },
        87: { 'I': ['b', 'c'] },
        88: { 'L': ['a', 'b'] },
        89: { 'L': ['b', 'c'] },
        90: { 'M': ['b', 'c'] },
        91: { 'M': ['a', 'b'] },
        92: { 'N': ['b', 'c'] },
        93: { 'O': ['b', 'c'] },
        94: { 'O': ['a', 'b'] },
        95: { 'Q1': ['b', 'c'] },
        96: { 'Q2': ['b', 'c'] },
        97: { 'Q2': ['b', 'c'] },
        98: { 'Q3': ['a', 'b'] },
        99: { 'Q4': ['a', 'b'] },
        100: { 'Q4': ['b', 'c'] },
        101: { 'A': ['a', 'b'] },
        102: { 'B': ['c'] },
        103: { 'B': ['b'] },
        104: { 'C': ['a', 'b'] },
        105: { 'C': ['a', 'b'] },
        106: { 'E': ['b', 'c'] },
        107: { 'F': ['b', 'c'] },
        108: { 'F': ['b', 'c'] },
        109: { 'G': ['a', 'b'] },
        110: { 'H': ['a', 'b'] },
        111: { 'H': ['a', 'b'] },
        112: { 'I': ['a', 'b'] },
        113: { 'L': ['a', 'b'] },
        114: { 'L': ['a', 'b'] },
        115: { 'M': ['a', 'b'] },
        116: { 'M': ['a', 'b'] },
        117: { 'N': ['a', 'b'] },
        118: { 'O': ['a', 'b'] },
        119: { 'O': ['a', 'b'] },
        120: { 'Q1': ['b', 'c'] },
        121: { 'Q2': ['b', 'c'] },
        122: { 'Q2': ['b', 'c'] },
        123: { 'Q3': ['b', 'c'] },
        124: { 'Q4': ['a', 'b'] },
        125: { 'Q4': ['b', 'c'] },
        126: { 'A': ['a', 'b'] },
        127: { 'B': ['c'] },
        128: { 'B': ['b'] },
        129: { 'C': ['b', 'c'] },
        130: { 'C': ['a', 'b'] },
        131: { 'E': ['a', 'b'] },
        132: { 'F': ['a', 'b'] },
        133: { 'F': ['a', 'b'] },
        134: { 'G': ['a', 'b'] },
        135: { 'H': ['a', 'b'] },
        136: { 'H': ['a', 'b'] },
        137: { 'I': ['b', 'c'] },
        138: { 'I': ['a', 'b'] },
        139: { 'L': ['b', 'c'] },
        140: { 'M': ['a', 'b'] },
        141: { 'M': ['b', 'c'] },
        142: { 'N': ['a', 'b'] },
        143: { 'O': ['a', 'b'] },
        144: { 'O': ['b', 'c'] },
        145: { 'Q1': ['a', 'b'] },
        146: { 'Q2': ['a', 'b'] },
        147: { 'Q3': ['b', 'c'] },
        148: { 'Q3': ['a', 'b'] },
        149: { 'Q4': ['a', 'b'] },
        150: { 'Q4': ['b', 'c'] },
        151: { 'A': ['b', 'c'] },
        152: { 'B': ['a'] },
        153: { 'B': ['c'] },
        154: { 'C': ['b', 'c'] },
        155: { 'E': ['a', 'b'] },
        156: { 'E': ['a', 'b'] },
        157: { 'F': ['b', 'c'] },
        158: { 'F': ['b', 'c'] },
        159: { 'G': ['b', 'c'] },
        160: { 'G': ['a', 'b'] },
        161: { 'H': ['b', 'c'] },
        162: { 'I': ['b', 'c'] },
        163: { 'I': ['a', 'b'] },
        164: { 'L': ['a', 'b'] },
        165: { 'M': ['b', 'c'] },
        166: { 'M': ['b', 'c'] },
        167: { 'N': ['a', 'b'] },
        168: { 'O': ['b', 'c'] },
        169: { 'Q1': ['a', 'b'] },
        170: { 'Q1': ['b', 'c'] },
        171: { 'Q2': ['a', 'b'] },
        172: { 'Q3': ['b', 'c'] },
        173: { 'Q3': ['a', 'b'] },
        174: { 'Q4': ['a', 'b'] },
        175: { 'Q4': ['b', 'c'] },
        176: { 'A': ['a', 'b'] },
        177: { 'B': ['a'] },
        178: { 'B': ['a'] },
        179: { 'C': ['a', 'b'] },
        180: { 'E': ['a', 'b'] },
        181: { 'E': ['a', 'b'] },
        182: { 'F': ['a', 'b'] },
        183: { 'F': ['a', 'b'] },
        184: { 'G': ['a', 'b'] },
        185: { 'G': ['a', 'b'] },
        186: { 'H': ['a', 'b'] },
    };
    let result: HashMap<string, number> = {
        'A': 0, 'B': 0, 'C': 0, 'E': 0,
        'F': 0, 'G': 0, 'H': 0, 'I': 0,
        'L': 0, 'M': 0, 'N': 0, 'O': 0,
        'Q1': 0, 'Q2': 0, 'Q3': 0, 'Q4': 0,
    };
    let answers: string[] = [];

    for (let num of arr) {
        if (num == 1) answers.push('a');
        else if (num == 2) answers.push('b');
        else if (num == 3) answers.push('c');
        else answers.push('');
    }
    
    for (let i = 0; i < answers.length; i++) {
        if (!correctAnswers[i+1]) continue;

        let key = Object.keys(correctAnswers[i+1])[0];
        let value= correctAnswers[i+1][key];

        if (!value.includes(answers[i])) continue;

        key == 'B' ? 
            result[key]++ :
            result[key] += value.length;
    }

    return JSON.stringify(result);
}