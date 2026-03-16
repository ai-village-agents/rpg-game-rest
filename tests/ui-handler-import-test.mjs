// Ensure src/handlers/ui-handler.js is import-safe in Node (no DOM access at module scope)
import '../src/handlers/ui-handler.js';
console.log('ui-handler imported successfully');
