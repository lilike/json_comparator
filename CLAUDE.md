# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A professional JSON comparison tool built with Next.js 14 that provides intelligent JSON formatting, sorting, and visual diff highlighting. The application supports both English and Chinese (Simplified) languages with full internationalization.

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
npm start

# Code quality
npm run lint
npm run type-check
```

## Architecture & Key Components

### Core Functionality
- **JSON Formatting**: Auto-formatting and minification via `utils/jsonFormatter.ts`
- **JSON Sorting**: Alphabetical, type-based, and original order sorting via `utils/jsonSorter.ts`
- **JSON Comparison**: Advanced diff detection using jsondiffpatch + json-diff engines via `utils/jsonDiffAdapter.ts`
- **JSON Repair**: Intelligent auto-repair using jsonrepair + custom algorithms via `utils/jsonRepairer.ts`

### Component Structure
- **JsonInput.tsx**: Textarea component with syntax highlighting and error display
- **JsonDiffViewer.tsx**: Advanced diff visualization with line-by-line highlighting
- **ControlPanel.tsx**: Main control interface for sorting and comparison options
- **ColorLegend.tsx**: Visual legend for diff types (added/removed/changed)
- **LanguageSwitcher.tsx**: Internationalization language toggle

### Internationalization Setup
- Uses `next-intl` with middleware-based routing
- Language files in `messages/` directory (en.json, zh-CN.json)
- URLs: `/en` (default), `/zh-CN`
- Automatic language detection and redirection from root path

### Diff Algorithm Features
- **Array Comparison**: Special handling for array elements with intelligent index matching
- **Object Property Matching**: Path-based field identification with priority scoring
- **Visual Indicators**: Color-coded highlighting (green=added, red=removed, yellow=changed)
- **Hover Details**: Enhanced tooltips showing before/after values for changes

## Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS
- **JSON Processing**: 
  - **Comparison**: jsondiffpatch (primary) + json-diff (fallback)
  - **Repair**: jsonrepair (primary) + custom algorithms (fallback)
- **Icons**: Lucide React
- **Internationalization**: next-intl

## Development Notes

### Advanced JSON Comparison System
The comparison engine in `utils/jsonDiffAdapter.ts` uses a dual-engine approach:

**Primary Engine: jsondiffpatch (v0.7.3)**
- Smart array element move detection with MOVED diff type
- Advanced nested object comparison with type-safe delta processing
- Optimized performance for large JSON structures
- Supports complex data transformations and patches

**Fallback Engine: json-diff**
- Ensures maximum compatibility for edge cases
- Handles scenarios where jsondiffpatch might fail
- Provides alternative parsing strategies

**Key Features:**
- Intelligent engine selection with automatic fallback
- Four diff types: ADDED, REMOVED, CHANGED, MOVED
- Deep nesting support with path-based identification
- Array element pairing algorithms for accurate change detection

### Intelligent JSON Repair System
The repair engine in `utils/jsonRepairer.ts` uses a dual-engine approach:

**Primary Engine: jsonrepair (v3.12.0)**
- Industry-leading JSON repair capability
- Handles LLM-generated malformed JSON
- Streaming support for large documents
- Advanced syntax error correction

**Fallback Engine: Custom Algorithms**
- 10-step repair process for comprehensive error fixing
- Bracket matching and balance correction
- Comment removal and quote normalization
- Comma insertion and trailing comma removal

**Repair Capabilities:**
- ✅ Missing quotes on object keys
- ✅ Single to double quote conversion
- ✅ Comment removal (// and /* */)
- ✅ Trailing comma elimination
- ✅ Missing comma insertion
- ✅ Undefined to null conversion
- ✅ Bracket/brace balancing
- ✅ Comprehensive error analysis and reporting

### UI State Management
The main page (`app/[locale]/page.tsx`) manages complex state for:
- Dual-pane JSON editing with independent formatting/sorting states
- Comparison mode toggle with preserved diff results
- Real-time error validation and user feedback

### Styling Conventions
- Dark theme with gray-900/800 gradient background
- Consistent button styling with hover states and disabled states
- Responsive grid layout that adapts to mobile/desktop
- Color-coded diff visualization following standard diff conventions

## Testing & Quality

### Comprehensive Test Suite
- **60+ Test Cases**: Located in `test-cases.json` covering all scenarios
- **Performance Tests**: Large JSON (1000+ properties), deep nesting (15 levels), large arrays (5000 elements)
- **Test Runner**: `test-runner.ts` for automated validation
- **Edge Cases**: Empty objects, null values, malformed JSON, LLM outputs

### Test Categories
1. **JSON Comparison Tests** (37 cases)
   - Basic object/array comparisons
   - Nested structures and complex scenarios
   - Real-world API response differences
   - Edge cases and boundary conditions

2. **JSON Repair Tests** (23 cases)
   - Syntax error corrections
   - Comment removal and quote fixes
   - Complex multi-error scenarios
   - LLM-generated malformed JSON

3. **Performance Tests** (3 cases)
   - Large-scale data processing
   - Memory efficiency validation
   - Response time benchmarks

### Quality Assurance
Always run before commits:
```bash
npm run type-check
npm run lint
npm run build
```

### Performance Benchmarks
- Small JSON (<1KB): <1ms
- Medium JSON (1-100KB): 1-10ms
- Large JSON (100KB-1MB): 10-100ms
- Deep nesting (15 levels): <50ms
- Large arrays (5000 elements): <100ms

### Test Execution
Run the comprehensive test suite:
```bash
# Run all tests with the test runner
npx ts-node test-runner.ts

# Run simple tests
node test-simple.js
```

### App Structure
- **Multi-page Application**: Routes for different JSON operations
  - `/compare` - JSON comparison
  - `/format` - JSON formatting
  - `/minify` - JSON minification
  - `/repair` - JSON repair
  - `/validate` - JSON validation
  - `/convert` - JSON conversion
- **Internationalized Routes**: All routes support `/en` and `/zh-CN` prefixes
- **Shared Components**: Reusable components across all pages