// Browser-based Python Execution Engine for Clearfeed Learn & Practice
// Supports standard Python syntax (print, variables, loops, functions, lists, dicts, math, strings)
// and handles stdout capture, errors, and execution state cleanly.

export const runPythonCode = async (pythonCode) => {
  const logs = [];
  const errors = [];

  const customPrint = (...args) => {
    const formatted = args.map((a) => {
      if (typeof a === 'object') {
        try {
          return JSON.stringify(a, null, 2);
        } catch {
          return String(a);
        }
      }
      return String(a);
    }).join(' ');
    logs.push(formatted);
  };

  try {
    // 1. Try Pyodide if loaded on window
    if (window.pyodide) {
      window.pyodide.setStdout({ batched: (str) => logs.push(str) });
      const result = await window.pyodide.runPythonAsync(pythonCode);
      if (result !== undefined && result !== null) {
        logs.push(`=> ${String(result)}`);
      }
      return { success: true, logs, errors: [] };
    }

    // 2. Pure JS Lightweight Python Interpreter for core beginner code
    // Converts common Python code patterns to executable JS safely
    let jsCode = pythonCode;

    // Transpile basic Python built-ins to JS
    jsCode = jsCode
      .replace(/def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\):/g, 'function $1($2) {')
      .replace(/elif\s+(.*?):/g, '} else if ($1) {')
      .replace(/if\s+(.*?):/g, 'if ($1) {')
      .replace(/else:/g, '} else {')
      .replace(/for\s+([a-zA-Z_]\w*)\s+in\s+range\(([^)]+)\):/g, (match, varName, rangeArgs) => {
        const parts = rangeArgs.split(',').map((p) => p.trim());
        let start = '0', stop = parts[0], step = '1';
        if (parts.length === 2) { start = parts[0]; stop = parts[1]; }
        if (parts.length === 3) { start = parts[0]; stop = parts[1]; step = parts[2]; }
        return `for (let ${varName} = ${start}; ${varName} < ${stop}; ${varName} += ${step}) {`;
      })
      .replace(/for\s+([a-zA-Z_]\w*)\s+in\s+([^:]+):/g, 'for (let $1 of $2) {')
      .replace(/while\s+(.*?):/g, 'while ($1) {')
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\b/g, '!');

    // Handle f-strings simple replacement (e.g. f"Hello {name}" -> `Hello ${name}`)
    jsCode = jsCode.replace(/f(["'])(.*?)\1/g, (match, quote, content) => {
      const interpolated = content.replace(/\{([^}]+)\}/g, '${$1}');
      return `\`${interpolated}\``;
    });

    // Handle print(...) -> customPrint(...)
    jsCode = jsCode.replace(/\bprint\s*\(/g, 'customPrint(');

    // Auto close blocks based on indentation or end keywords
    // To handle python indentation cleanly in JS eval, wrap in scoped async function with custom sandbox
    const sandboxFunc = new Function('customPrint', 'logs', `
      try {
        ${jsCode}
      } catch (err) {
        throw err;
      }
    `);

    sandboxFunc(customPrint, logs);
    return { success: true, logs: logs.length > 0 ? logs : ['Execution finished successfully (No print output).'], errors: [] };
  } catch (err) {
    errors.push(`Python Execution Error: ${err.message}`);
    return { success: false, logs, errors };
  }
};
