'use server'

import fs from 'fs/promises';
import path from 'path';

export type ErrorLogEntry = {
    id: string;
    timestamp: string;
    title: string;
    component: string;
    message: string;
    stackTrace: string | null;
}

export async function fetchErrorLogs(): Promise<ErrorLogEntry[]> {
    try {
        const filePath = path.join(process.cwd(), 'error-log.md');
        const content = await fs.readFile(filePath, 'utf8');
        
        // Parse the markdown file
        // Entries are separated by "---\n"
        const chunks = content.split('---').filter(chunk => chunk.trim() !== '');
        
        const entries: ErrorLogEntry[] = [];
        
        for (let i = 0; i < chunks.length; i++) {
            let chunk = chunks[i].trim();
            
            // Strip out the global markdown title if it's bundled in the first chunk
            if (chunk.includes('# Application Error Logs')) {
                chunk = chunk.replace('# Application Error Logs', '').trim();
            }
            
            if (!chunk.startsWith('## [')) continue; // skip garbage data
            
            // Extract Timestamp and Title: ## [2026-03-31T22:00:00.000Z] Error Title
            const headerMatch = chunk.match(/## \[([^\]]+)\] (.*)/);
            if (!headerMatch) continue;
            
            const timestamp = headerMatch[1];
            const title = headerMatch[2].trim();
            
            // Extract Component: **Component:** `component_name`
            const componentMatch = chunk.match(/\*\*Component:\*\* `([^`]+)`/);
            const component = componentMatch ? componentMatch[1] : 'Unknown Component';
            
            // Extract Message: **Message:** message string
            const messageMatch = chunk.match(/\*\*Message:\*\* (.*)/);
            const message = messageMatch ? messageMatch[1].trim() : 'No exception message provided';
            
            // Extract Stack Trace (if exists within details)
            let stackTrace = null;
            const stackMatch = chunk.match(/```text\n([\s\S]*?)```/);
            if (stackMatch) {
                stackTrace = stackMatch[1].trim();
            }
            
            entries.push({
                id: `err-${i}-${Date.now()}`,
                timestamp,
                title,
                component,
                message,
                stackTrace
            });
        }
        
        // Reverse so the newest ones are at the top of the UI
        return entries.reverse();
    } catch (e) {
        return []; // If file doesn't exist yet, return empty array
    }
}

export async function clearErrorLogs(): Promise<boolean> {
    try {
        const filePath = path.join(process.cwd(), 'error-log.md');
        await fs.writeFile(filePath, '# Application Error Logs\n\n', 'utf8');
        return true;
    } catch (e) {
        return false;
    }
}
