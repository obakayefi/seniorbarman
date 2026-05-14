import fs from 'fs/promises';
import path from 'path';

export async function logSilentError(
    title: string,
    message: string,
    component: string,
    stackTrace?: string
) {
    try {
        const filePath = path.join(process.cwd(), 'error-log.md');
        const timestamp = new Date().toISOString();
        
        // Ensure the file exists with a title if it's completely new
        try {
            await fs.access(filePath);
        } catch {
            await fs.writeFile(filePath, '# Application Error Logs\n\n', 'utf8');
        }

        // Create GitHub Flavored Markdown entry
        const logEntry = `
## [${timestamp}] ${title}
**Component:** \`${component}\`

**Message:** ${message}

${stackTrace ? `<details><summary>Stack Trace</summary>\n\n\`\`\`text\n${stackTrace}\n\`\`\`\n</details>\n` : ''}
---
`;

        await fs.appendFile(filePath, logEntry, 'utf8');
        console.log(`[Logger] Successfully archived error to error-log.md: ${title}`);
    } catch (fsError) {
        console.error('[Logger] FATAL: Failed to write to error-log.md', fsError);
    }
}
