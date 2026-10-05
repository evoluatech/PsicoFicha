const fs = require('fs');
const path = require('path');

function patchFile(filePath, replacer) {
  try {
    const fullPath = path.resolve(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = replacer(content);
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Successfully patched ${filePath}`);
      }
    }
  } catch (err) {
    console.warn(`Could not patch ${filePath}:`, err.message);
  }
}

// 1. Patch entry-base.js (CJS)
patchFile('node_modules/next/dist/server/app-render/entry-base.js', (content) => {
  return content.replace(
    /if\s*\(\s*process\.env\.NODE_ENV\s*===\s*['"]development['"]\s*\)\s*\{\s*const\s+mod\s*=\s*require\(['"][^'"]*segment-explorer-node['"]\);[\s\S]*?\}/g,
    `// Segment explorer disabled to avoid RSC client manifest mismatch
SegmentViewNode = (props) => (props && props.children ? props.children : null);
SegmentViewStateNode = () => null;`
  );
});

// 2. Patch entry-base.js (ESM)
patchFile('node_modules/next/dist/esm/server/app-render/entry-base.js', (content) => {
  return content.replace(
    /if\s*\(\s*process\.env\.NODE_ENV\s*===\s*['"]development['"]\s*\)\s*\{\s*const\s+mod\s*=\s*require\(['"][^'"]*segment-explorer-node['"]\);[\s\S]*?\}/g,
    `// Segment explorer disabled to avoid RSC client manifest mismatch
SegmentViewNode = (props) => (props && props.children ? props.children : null);
SegmentViewStateNode = () => null;`
  );
});

// 3. Patch segment-explorer-node.js to be completely neutral and safe
patchFile('node_modules/next/dist/next-devtools/userspace/app/segment-explorer-node.js', () => {
  return `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEGMENT_EXPLORER_SIMULATED_ERROR_MESSAGE = 'NEXT_DEVTOOLS_SIMULATED_ERROR';
exports.SegmentBoundaryTriggerNode = function() { return null; };
exports.SegmentStateProvider = function(props) { return props ? props.children : null; };
exports.SegmentViewNode = function(props) { return props ? props.children : null; };
exports.SegmentViewStateNode = function() { return null; };
exports.useSegmentState = function() { return { boundaryType: null, setBoundaryType: function() {} }; };
`;
});

// 4. Patch ESM segment-explorer-node.js
patchFile('node_modules/next/dist/esm/next-devtools/userspace/app/segment-explorer-node.js', () => {
  return `export const SEGMENT_EXPLORER_SIMULATED_ERROR_MESSAGE = 'NEXT_DEVTOOLS_SIMULATED_ERROR';
export function SegmentBoundaryTriggerNode() { return null; }
export function SegmentStateProvider(props) { return props ? props.children : null; }
export function SegmentViewNode(props) { return props ? props.children : null; }
export function SegmentViewStateNode() { return null; }
export function useSegmentState() { return { boundaryType: null, setBoundaryType: () => {} }; }
`;
});
