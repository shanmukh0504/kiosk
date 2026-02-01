const fs = require('fs');
const path = require('path');

const MARKER = '<!-- ci-test-results -->';
const MAX_FILES_TO_SHOW = 30;
const MAX_TESTS_TO_SHOW = 20;

function findFile(dir, filename) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = findFile(fullPath, filename);
        if (found) return found;
      } else if (entry.name === filename) {
        return fullPath;
      }
    }
  } catch (e) {
    // Directory doesn't exist or can't read
  }
  return null;
}

function readFileSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (e) {
    // File doesn't exist or can't read
  }
  return null;
}

function parsePercyOutput(output) {
  const urlMatch = output.match(/https:\/\/percy\.io\/[^\s)\]]+/);
  const snapshotMatches = output.match(/Snapshot taken: ([^\n]+)/g) || [];
  const buildMatch = output.match(/Finalized build #(\d+):\s*(https:\/\/percy\.io\/[^\s)]+)/);
  
  return {
    url: urlMatch ? urlMatch[0] : null,
    buildNumber: buildMatch ? buildMatch[1] : null,
    snapshotCount: snapshotMatches.length,
    snapshots: snapshotMatches.map(m => m.replace('Snapshot taken: ', ''))
  };
}

function parseCoverage(coverageSummary) {
  if (!coverageSummary || !coverageSummary.total) {
    return null;
  }

  const total = coverageSummary.total;
  const formatPct = (pct) => pct === undefined ? 'N/A' : `${pct.toFixed(1)}%`;
  const getStatus = (pct) => {
    if (pct === undefined) return '';
    if (pct >= 80) return ' ✅';
    if (pct >= 50) return ' ⚠️';
    return ' ❌';
  };

  const noCoverage = [];
  const lowCoverage = [];

  Object.entries(coverageSummary).forEach(([file, data]) => {
    if (file === 'total' || !data.statements) return;
    const pct = data.statements.pct;
    if (pct === 0) {
      noCoverage.push({ file, data });
    } else if (pct < 80) {
      lowCoverage.push({ file, data });
    }
  });

  lowCoverage.sort((a, b) => a.data.statements.pct - b.data.statements.pct);

  return {
    total: {
      statements: { pct: total.statements?.pct, formatted: formatPct(total.statements?.pct), status: getStatus(total.statements?.pct) },
      branches: { pct: total.branches?.pct, formatted: formatPct(total.branches?.pct), status: getStatus(total.branches?.pct) },
      functions: { pct: total.functions?.pct, formatted: formatPct(total.functions?.pct), status: getStatus(total.functions?.pct) },
      lines: { pct: total.lines?.pct, formatted: formatPct(total.lines?.pct), status: getStatus(total.lines?.pct) }
    },
    noCoverage,
    lowCoverage
  };
}

function parseJestOutput(output) {
  const summaryMatch = output.match(/Test Suites:.*?(\d+)\s+failed.*?(\d+)\s+passed.*?Tests:.*?(\d+)\s+failed.*?(\d+)\s+passed/);
  const lines = output.split('\n');
  
  const failedSuites = [];
  const failedTests = [];
  let currentSuite = null;
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const suiteMatch = line.match(/FAIL\s+(.+\.test\.(tsx?|jsx?))/);
    if (suiteMatch) {
      currentSuite = suiteMatch[1];
      failedSuites.push(currentSuite);
    }
    
    const testMatch = line.match(/●\s+([^›]+)›\s+(.+)/);
    if (testMatch && currentSuite) {
      failedTests.push({
        suite: currentSuite,
        name: testMatch[2].trim()
      });
    }

    if (line.includes('Error:') || 
        line.includes('TypeError:') || 
        line.includes('ReferenceError:') ||
        line.match(/at\s+.*\(.*:\d+:\d+\)/)) {
      errors.push(line);
    }
  }

  return {
    summary: summaryMatch ? {
      suitesFailed: parseInt(summaryMatch[1]),
      suitesPassed: parseInt(summaryMatch[2]),
      testsFailed: parseInt(summaryMatch[3]),
      testsPassed: parseInt(summaryMatch[4])
    } : null,
    failedSuites,
    failedTests,
    errors: errors.slice(-30)
  };
}

function generateCommentBody(percyData, coverageData, jestData, visualJobRan, visualJobFailed, testJobRan, testJobFailed, runUrl) {
  let body = `## CI Test Results\n\n${MARKER}\n\n`;

  body += '### 🎨 Visual Tests (Playwright + Percy)\n\n';
  
  if (visualJobRan) {
    if (percyData.url) {
      body += `✅ **Visual comparison:** [View Percy build](${percyData.url})`;
      if (percyData.buildNumber) {
        body += ` (Build #${percyData.buildNumber})`;
      }
      body += '\n\n';
      
      if (percyData.snapshotCount > 0) {
        body += `**Snapshots:** ${percyData.snapshotCount} taken\n`;
        if (percyData.snapshots.length > 0 && percyData.snapshots.length <= 10) {
          body += percyData.snapshots.map(s => `- ${s}`).join('\n');
        }
        body += '\n\n';
      }
    } else if (visualJobFailed) {
      body += '❌ **Visual tests failed.** Percy build link not found.\n\n';
    } else {
      body += '⚠️ Visual tests completed but Percy link not found in output.\n\n';
    }
  } else {
    body += '⚠️ Visual tests were skipped (secrets not configured).\n\n';
  }

  body += '### 📊 Coverage Results\n\n';
  
  if (coverageData) {
    const { total, noCoverage, lowCoverage } = coverageData;
    
    body += `| Metric | Coverage | Status |\n`;
    body += `|--------|----------|--------|\n`;
    body += `| **Statements** | ${total.statements.formatted} |${total.statements.status} |\n`;
    body += `| **Branches** | ${total.branches.formatted} |${total.branches.status} |\n`;
    body += `| **Functions** | ${total.functions.formatted} |${total.functions.status} |\n`;
    body += `| **Lines** | ${total.lines.formatted} |${total.lines.status} |\n\n`;

    if (noCoverage.length > 0) {
      body += `<details><summary>❌ <strong>Files with no coverage</strong> (${noCoverage.length})</summary>\n\n`;
      noCoverage.slice(0, MAX_FILES_TO_SHOW).forEach(({ file }) => {
        const relPath = file.replace(process.cwd() + '/', '').replace(/^.*\//, '');
        body += `- \`${relPath}\`\n`;
      });
      if (noCoverage.length > MAX_FILES_TO_SHOW) {
        body += `\n<em>... and ${noCoverage.length - MAX_FILES_TO_SHOW} more files with no coverage</em>\n`;
      }
      body += '</details>\n\n';
    }

    if (lowCoverage.length > 0) {
      body += `<details><summary>⚠️ <strong>Files with low coverage (&lt; 80%)</strong> (${lowCoverage.length})</summary>\n\n`;
      body += `| File | Statements | Branches | Functions | Lines |\n`;
      body += `|------|------------|----------|-----------|-------|\n`;
      lowCoverage.slice(0, MAX_FILES_TO_SHOW).forEach(({ file, data }) => {
        const relPath = file.replace(process.cwd() + '/', '').replace(/^.*\//, '');
        const s = data.statements?.pct?.toFixed(1) || 'N/A';
        const b = data.branches?.pct?.toFixed(1) || 'N/A';
        const f = data.functions?.pct?.toFixed(1) || 'N/A';
        const l = data.lines?.pct?.toFixed(1) || 'N/A';
        body += `| \`${relPath}\` | ${s}% | ${b}% | ${f}% | ${l}% |\n`;
      });
      if (lowCoverage.length > MAX_FILES_TO_SHOW) {
        body += `\n<em>... and ${lowCoverage.length - MAX_FILES_TO_SHOW} more files with low coverage</em>\n`;
      }
      body += '</details>\n\n';
    }
  } else {
    body += '⚠️ Coverage data not available. Check the workflow run for details.\n\n';
  }

  body += '### ✅ Test Results\n\n';
  
  if (testJobRan) {
    if (testJobFailed && jestData) {
      body += '❌ **Some tests failed.**\n\n';
      
      if (jestData.summary) {
        const { suitesFailed, suitesPassed, testsFailed, testsPassed } = jestData.summary;
        body += `**Summary:** ${suitesFailed} test suite(s) failed, ${suitesPassed} passed. `;
        body += `${testsFailed} test(s) failed, ${testsPassed} passed.\n\n`;
      }

      if (jestData.failedSuites.length > 0) {
        body += '**Failed test suites:**\n';
        jestData.failedSuites.slice(0, 15).forEach(suite => {
          const relPath = suite.replace(process.cwd() + '/', '');
          body += `- \`${relPath}\`\n`;
        });
        if (jestData.failedSuites.length > 15) {
          body += `\n<em>... and ${jestData.failedSuites.length - 15} more test suites</em>\n`;
        }
        body += '\n';
      }

      if (jestData.failedTests.length > 0) {
        body += `<details><summary><strong>Failed tests</strong> (${jestData.failedTests.length})</summary>\n\n`;
        jestData.failedTests.slice(0, MAX_TESTS_TO_SHOW).forEach(({ suite, name }) => {
          const relPath = suite.replace(process.cwd() + '/', '');
          body += `- \`${relPath}\`: **${name}**\n`;
        });
        if (jestData.failedTests.length > MAX_TESTS_TO_SHOW) {
          body += `\n<em>... and ${jestData.failedTests.length - MAX_TESTS_TO_SHOW} more failed tests</em>\n`;
        }
        body += '</details>\n\n';
      }

      if (jestData.errors.length > 0) {
        const escaped = jestData.errors.join('\n').replace(/```/g, '`\u200b`\u200b`');
        body += '<details><summary>Error details</summary>\n\n```\n' + escaped + '\n```\n</details>\n\n';
      }

      body += `[View workflow run](${runUrl}) for full test output.\n\n`;
    } else if (jestData && jestData.summary) {
      const { suitesPassed, testsPassed } = jestData.summary;
      body += `✅ **All tests passed** (${testsPassed} tests in ${suitesPassed} suites)\n\n`;
    } else {
      body += '✅ **All tests passed**\n\n';
    }
  } else {
    body += '⚠️ Tests were skipped.\n\n';
  }

  body += `---\n[View full workflow run](${runUrl})\n`;
  
  return body;
}

async function main() {
  const args = process.argv.slice(2);
  const visualJobRan = args[0] === 'true';
  const visualJobFailed = args[1] === 'true';
  const testJobRan = args[2] === 'true';
  const testJobFailed = args[3] === 'true';
  const runUrl = args[4] || '';

  let percyOutput = '';
  const percyPaths = [
    'percy-test-output/percy-test-output.txt',
    'percy-test-output.txt',
    findFile('.', 'percy-test-output.txt')
  ].filter(Boolean);
  
  for (const p of percyPaths) {
    const content = readFileSafe(p);
    if (content) {
      percyOutput = content;
      break;
    }
  }

  const percyData = parsePercyOutput(percyOutput);

  let coverageSummary = null;
  const coveragePaths = [
    'coverage-report/coverage-summary.json',
    'coverage/coverage-summary.json',
    findFile('coverage-report', 'coverage-summary.json'),
    findFile('coverage', 'coverage-summary.json')
  ].filter(Boolean);

  for (const p of coveragePaths) {
    const content = readFileSafe(p);
    if (content) {
      try {
        coverageSummary = JSON.parse(content);
        break;
      } catch (e) {
      }
    }
  }

  const coverageData = parseCoverage(coverageSummary);

  let jestOutput = '';
  const jestPaths = [
    'jest-test-output/jest-test-output.txt',
    'jest-test-output.txt',
    findFile('.', 'jest-test-output.txt')
  ].filter(Boolean);
  
  for (const p of jestPaths) {
    const content = readFileSafe(p);
    if (content) {
      jestOutput = content;
      break;
    }
  }

  const jestData = parseJestOutput(jestOutput);

  const commentBody = generateCommentBody(
    percyData,
    coverageData,
    jestData,
    visualJobRan,
    visualJobFailed,
    testJobRan,
    testJobFailed,
    runUrl
  );

  fs.writeFileSync('pr-comment-body.txt', commentBody);
  console.log('Comment body generated successfully');
}

main().catch(err => {
  console.error('Error generating comment:', err);
  process.exit(1);
});
