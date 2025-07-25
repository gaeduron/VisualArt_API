# Canvas

These components are going to be used to create a drawing tool that should do the following:
Canvas:
- Have a square canvas 500x500px by default
- The canvas background can be changed with a 500x500px image
- The canvas can be exported as a png (download button)
Tools:
- Pixel brush, 2px wide, with the color #000000 by default
- Brush color can be changed in a palette of 4 pastel colors (black, blue, green, red)
- Clear canvas button
- Undo
- Redo
- Eraser tool, 10px wide by default
- eraser size can be changed between 2 size (8px, 80px)

The goal is to be as simple as possible in feature and in code complexity.

## process:
Let's build this progressively to make it easy to review for the human. he can't review more than 100 lines at a time so let's do things incrementally.

step 1 (completed):
- Have a square canvas 500x500px by default
- Pixel brush, 2px wide, with the color #000000 by default

step 2:
- Undo and Redo buttons with support for shortcuts (ctrl+z and ctrl+maj+z respectively on mac use command)

# Drawing Evaluation

A system to compare user drawings against reference images and provide feedback through visual analysis.

## Overview
The drawing evaluation feature allows users to:
1. View a reference image alongside their canvas
2. Draw to match the reference
3. Submit their drawing for evaluation
4. View results in a history stack with detailed feedback

## Architecture
- **Reference Display**: Side-by-side layout with reference image
- **Evaluation Engine**: Backend processing with visual comparison
- **History Stack**: Results display with loading states and detailed views
- **Side Sheet**: Expanded result view with statistics

---

## Implementation Steps

### Step 1: Reference Image Display (1 hour)
**Goal**: Display reference image next to canvas in responsive layout

**Components to Create**:
- `ReferenceImage.tsx` (50-80 lines)
- `CanvasLayout.tsx` (80-120 lines) 
- `useReferenceImage.ts` hook (40-60 lines)

**Features**:
- Side-by-side layout (reference left, canvas right)
- Responsive design that maintains aspect ratios
- Reference image loading states and error handling
- Placeholder when no reference is set

**Props/API**:
```typescript
interface ReferenceImageProps {
  imageUrl?: string;
  isLoading?: boolean;
  onImageLoad?: () => void;
  alt?: string;
}
```

---

### Step 2: Evaluate Button & Tab Shortcut (1 hour)
**Goal**: Add evaluation trigger with destructive action confirmation

**Components to Create**:
- `EvaluateButton.tsx` (60-80 lines)
- Update `shortcuts.config.ts` (10-20 lines)
- Update canvas actions hook (30-50 lines)

**Features**:
- "Evaluate" button in toolbar before export button (matches existing button style)
- Tab shortcut for evaluation (tab key)
- Does not clear the canvas or trigger any other action other than starting the evaluation process 
- The evaluation will be triggered with a useEvaluation hook that will just make an alert for now

**Integration**:
- Add to existing toolbar with separator
- Extend shortcut system with Tab key
- Connect to canvas clear functionality

---

### Step 3: mocked evaluation
I want the mock evaluation to return an object that contains the following fields:
- top_5_error_rate: number (from 0 to 20 usualy but can go up to 100, it's a percentage)
- numberOfPixels: number
- comparisonImage: string (base64 encoded image, or a url)

the comparisonImage should be the `/public/evaluated_image_exemple.png` at the root of the project.

---

### Step 4: Evaluation History Component (1 hour)
**Goal**: Display evaluation results in a vertical stack

**Components to Create**:
Use components from the `EvaluationHistory` folder.

**Features**:
- Vertical stack on the right side of screen
- Open by default
- Closeable side sheet
- Thumbnail view of results (with the comparisonImage + top_5_error_rate on top)
- scrollable history stack, new items should be added at the top

**States**:
- Loading: Shows user drawing with spinner overlay
- Success: Shows result thumbnail with accuracy score
- Error: Shows error state with retry option

---

### Step 5: Evaluation Details (1 hour)
**Goal**: Detailed view of evaluation results with statistics

**Components to Create**:
- `EvaluationDetails.tsx`

**Features**:
- dialog open when you click on a result thumbnail
- show the comparisonImage
- show the top_5_error_rate
- show the numberOfPixels
- show the createdAt date
- show the referenceImage
- show the userDrawing

---

### Step 6: Layout Integration & Polish (1 hour)
**Goal**: Integrate all components into cohesive layout

**Updates to Existing**:
- `Canvas/index.tsx` layout restructure (80-120 lines)
- `page.tsx` main layout updates (40-60 lines)
- Responsive design refinements (60-100 lines)

**Features**:
- Three-column layout: Reference | Canvas | History
- Responsive breakpoints for mobile/tablet
- Proper spacing and visual hierarchy
- Loading states coordination
- Error boundary integration

**Layout Breakpoints**:
- Desktop: Side-by-side three columns
- Tablet: Stacked with collapsible panels
- Mobile: Full-width with tab navigation

---

### Step 7: Evaluation API Integration (1 hour)
**Goal**: Create evaluation service and data flow

**Files to Create**:
- `services/evaluationApi.ts` (80-120 lines)
- `hooks/useEvaluation.ts` (100-150 lines)
- `types/evaluation.ts` (40-60 lines)

**Features**:
- API service for sending reference + user drawing
- Loading states and error handling
- Retry logic for failed evaluations
- TypeScript interfaces for evaluation data

**API Structure**:
```typescript
interface EvaluationRequest {
  referenceImage: string; // base64 data URL
  userDrawing: string;    // base64 data URL
  timestamp: number;
}

interface EvaluationResult {
  id: string;
  accuracy: number;
  feedback: string;
  comparisonImage: string;
  metrics: EvaluationMetrics;
}
```

## Technical Considerations

### State Management
- Evaluation results stored in React state (no global state needed initially)
- Reference image URL management
- Loading states coordination across components

### Performance
- Image optimization for reference display
- Lazy loading for history stack items
- Debounced evaluation triggers

### Accessibility
- Keyboard navigation for history stack
- Screen reader support for evaluation results
- Focus management in side sheet

### Future Extensions
- Left-handed layout option (mirror reference to right side)
- Multiple reference images
- Evaluation history persistence
- Export evaluation reports

---

## File Structure
```
src/components/
├── Canvas/
│   ├── components/
│   │   ├── ReferenceImage.tsx
│   │   └── EvaluateButton.tsx
│   └── hooks/
│       ├── useReferenceImage.ts
│       └── useEvaluation.ts
├── Evaluation/
│   ├── components/
│   │   ├── HistoryStack.tsx
│   │   ├── HistoryItem.tsx
│   │   ├── ResultSideSheet.tsx
│   │   ├── EvaluationStats.tsx
│   │   └── ComparisonView.tsx
│   ├── hooks/
│   │   └── useHistoryStack.ts
│   └── types/
│       └── evaluation.ts
└── services/
    └── evaluationApi.ts
```

Each step builds incrementally on the previous one, maintaining the same code review friendly approach as the canvas implementation.