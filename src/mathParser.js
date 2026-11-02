// Safe math expression parser - replaces eval() for security
// Supports: +, -, *, /, ^, sqrt, sin, cos, tan, log, ln, factorial

// Helper untuk menghitung faktorial
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Helper untuk operasi dasar dengan operator precedence
function evaluateBasic(expr) {
  // Urutan operasi: faktorial -> power -> multiply/divide -> add/subtract
  
  // Tangani faktorial terlebih dahulu
  let result = expr.replace(/(\d+)!/g, (match, p1) => factorial(parseInt(p1)));
  
  // Tangani pangkat
  result = result.replace(/(\d+(?:\.\d+)?)\s*\^\s*(\d+(?:\.\d+)?)/g, (match, base, exp) => {
    return Math.pow(parseFloat(base), parseFloat(exp));
  });
  
  // Tangani perkalian dan pembagian
  while (/(\d+(?:\.\d+)?)\s*[*/]\s*(\d+(?:\.\d+)?)/.test(result)) {
    result = result.replace(/(\d+(?:\.\d+)?)\s*\*\s*(\d+(?:\.\d+)?)/, (match, a, b) => {
      return parseFloat(a) * parseFloat(b);
    });
    result = result.replace(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/, (match, a, b) => {
      return b !== '0' ? parseFloat(a) / parseFloat(b) : 'ERROR';
    });
  }
  
  // Tangani penjumlahan dan pengurangan
  while (/(\d+(?:\.\d+)?)\s*[+-]\s*(\d+(?:\.\d+)?)/.test(result)) {
    result = result.replace(/(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)/, (match, a, b) => {
      return parseFloat(a) + parseFloat(b);
    });
    result = result.replace(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/, (match, a, b) => {
      return parseFloat(a) - parseFloat(b);
    });
  }
  
  return result;
}

// Resolve plain arithmetic parentheses, misal "(2+3)*4", dengan mengevaluasi
// grup terdalam (yang tidak berisi tanda kurung lagi) lebih dulu secara
// berulang sampai tidak ada tanda kurung yang tersisa. Dijalankan setelah
// fungsi bernama (sqrt/log/sin/dst) sudah menyerap tanda kurung miliknya sendiri.
function resolveParentheses(expr) {
  let result = expr;
  const innermostParenRegex = /\(([^()]+)\)/;

  while (innermostParenRegex.test(result)) {
    result = result.replace(innermostParenRegex, (match, inner) => {
      const innerResult = evaluateBasic(inner);
      return innerResult;
    });
  }

  return result;
}

// Main parser - tangani semua tipe ekspresi
export function parseMathExpression(expression) {
  try {
    let processed = expression.toLowerCase().trim();
    
    // Tangani akar kuadrat: sqrt(x) atau akar(x)
    if (processed.includes('sqrt') || processed.includes('akar')) {
      // Fixed: escape special characters in character class - use \- untuk dash
      const sqrtRegex = /(?:sqrt|akar)\s*\(\s*([0-9.+*/^()-]+)\s*\)/g;
      processed = processed.replace(sqrtRegex, (match, p1) => {
        const innerResult = evaluateBasic(p1);
        return Math.sqrt(parseFloat(innerResult));
      });
      
      // Tangani format "akar 16" tanpa kurung
      const sqrtNoParenRegex = /akar\s+([0-9.]+)/g;
      processed = processed.replace(sqrtNoParenRegex, (match, p1) => {
        return Math.sqrt(parseFloat(p1));
      });
    }
    
    // Tangani logaritma: log(x), log10(x), ln(x)
    if (processed.includes('log') || processed.includes('ln')) {
      const log10Regex = /log10\s*\(\s*([0-9.+*/^()-]+)\s*\)/g;
      processed = processed.replace(log10Regex, (match, p1) => {
        const innerResult = evaluateBasic(p1);
        return Math.log10(parseFloat(innerResult));
      });
      
      // Tangani log(x) - natural log (base e)
      const logRegex = /log\s*\(\s*([0-9.+*/^()-]+)\s*\)/g;
      processed = processed.replace(logRegex, (match, p1) => {
        const innerResult = evaluateBasic(p1);
        return Math.log10(parseFloat(innerResult));
      });
      
      const lnRegex = /ln\s*\(\s*([0-9.+*/^()-]+)\s*\)/g;
      processed = processed.replace(lnRegex, (match, p1) => {
        const innerResult = evaluateBasic(p1);
        return Math.log(parseFloat(innerResult));
      });
    }
    
    // Tangani trigonometri: sin(x), cos(x), tan(x)
    if (processed.includes('sin') || processed.includes('cos') || processed.includes('tan')) {
      const sinRegex = /sin\s*\(\s*([0-9.+*/^()-]+)\s*\)/g;
      processed = processed.replace(sinRegex, (match, p1) => {
        const innerResult = evaluateBasic(p1);
        const degrees = parseFloat(innerResult);
        return Math.sin((degrees * Math.PI) / 180); // konversi ke radian
      });
      
      const cosRegex = /cos\s*\(\s*([0-9.+*/^()-]+)\s*\)/g;
      processed = processed.replace(cosRegex, (match, p1) => {
        const innerResult = evaluateBasic(p1);
        const degrees = parseFloat(innerResult);
        return Math.cos((degrees * Math.PI) / 180); // konversi ke radian
      });
      
      const tanRegex = /tan\s*\(\s*([0-9.+*/^()-]+)\s*\)/g;
      processed = processed.replace(tanRegex, (match, p1) => {
        const innerResult = evaluateBasic(p1);
        const degrees = parseFloat(innerResult);
        return Math.tan((degrees * Math.PI) / 180); // konversi ke radian
      });
    }
    
    // Tangani tanda kurung aritmetika biasa, misal (2+3)*4
    processed = resolveParentheses(processed);

    // Evaluasi ekspresi final yang sudah ditangani fungsi-fungsinya
    const result = evaluateBasic(processed);
    
    // Cek apakah hasil ada error
    if (result === 'ERROR' || result === 'NaN' || isNaN(result)) {
      return 'ERROR';
    }
    
    // Format hasil dengan maksimal 4 decimal
    const numResult = parseFloat(result);
    return Number.isInteger(numResult) ? numResult : parseFloat(numResult.toFixed(4));
    
  } catch (error) {
    console.error('Math parser error:', error.message);
    return 'ERROR';
  }
}

// Export untuk testing
export function factorialHelper(n) {
  return factorial(n);
}
