# 📚 SearchInput Component - Q&A Documentation

## Question 1: ForwardRef - Apa itu dan kapan dipakai?

### **Konsep Dasar**

`forwardRef` = mechanism untuk **meneruskan ref dari parent ke DOM element di dalam child component**.

### **Kenapa Dibutuhkan?**

```typescript
// ❌ Tanpa forwardRef - ERROR
function SearchInput() {
  return <input />;
}

<SearchInput ref={inputRef} />  // Error: Function components cannot be given refs

// ✅ Dengan forwardRef - WORKS
const SearchInput = forwardRef((props, ref) => {
  return <input ref={ref} />;  // Ref diteruskan ke DOM element
});

<SearchInput ref={inputRef} />  // ✅ Works!
inputRef.current.focus();       // ✅ Can access DOM methods
```

### **Visualisasi Flow**

```
Parent's ref
    ↓
Child component (via forwardRef)
    ↓
Actual DOM element inside child
```

### **Use Cases**

- ✅ Focus management (keyboard shortcuts)
- ✅ Scroll control
- ✅ Measuring element dimensions
- ✅ Third-party library integration
- ❌ Jangan pakai untuk bypassing React state (anti-pattern)

### **Syntax**

```typescript
const Component = forwardRef<ElementType, PropsType>(
  (props, ref) => {
    return <element ref={ref} />;
  }
);
```

---

## Question 2: Debounce - Konsep dan implementasi dengan useEffect

### **Konsep**

**Debounce** = Tunggu user selesai melakukan aksi berulang, baru jalankan fungsi sekali.

### **Problem Without Debounce**

```
User types "tab":
- "t" → filter 1000 vocabs
- "ta" → filter 1000 vocabs
- "tab" → filter 1000 vocabs
Result: 3 expensive operations ❌
```

### **Solution With Debounce (300ms)**

```
User types "tab":
- "t" → wait 300ms...
- "ta" (cancel previous timer) → wait 300ms...
- "tab" (cancel previous timer) → wait 300ms...
- [user stops]
- 300ms passed → filter once!
Result: 1 operation ✅
```

### **Implementation**

```typescript
const [internalValue, setInternalValue] = useState(value);

useEffect(() => {
  // Start timer
  const timer = setTimeout(() => {
    onChange(internalValue); // Execute after 300ms
  }, 300);

  // Cleanup: cancel previous timer
  return () => clearTimeout(timer);
}, [internalValue, onChange]);
```

### **Execution Flow**

```
User types "t":
  → useEffect runs
  → setTimeout schedules onChange("t") in 300ms
  → Cleanup function saved

User types "a" (before 300ms):
  → Cleanup runs: clearTimeout() ← Cancel "t" timer!
  → New useEffect runs
  → setTimeout schedules onChange("ta") in 300ms
  → New cleanup saved

300ms passes:
  → onChange("ta") executes (only once!) ✅
```

### **Why Dependencies: `[internalValue, onChange]`?**

- `internalValue` = main trigger (runs on every keystroke)
- `onChange` = best practice (ensure fresh reference, prevent stale closures)

### **Why Two States?**

- `internalValue` (child) = instant UI updates (no lag)
- `value` (parent) = debounced updates (efficient filtering)

---

## Question 3: useEffect Return (Cleanup) - Execution order

### **Key Concept**

**Cleanup = "Finish previous effect before starting new one"**

### **Execution Order**

```
First render (mount):
  🟢 Effect body runs
  [Cleanup saved, NOT executed yet]

Dependency changes:
  🔴 Cleanup runs (finish previous effect)
  🟢 New effect body runs (start new effect)
  [New cleanup saved]

Component unmounts:
  🔴 Final cleanup runs
```

### **Answer to Question**

> "return di useEffect itu mostly executed before running useEffect yg sama?"

**YES!** Cleanup runs **before** the new effect (except on first mount).

### **Example**

```typescript
useEffect(() => {
  console.log("Setup:", value);

  return () => {
    console.log("Cleanup:", value);
  };
}, [value]);

// Execution:
// Mount: "Setup: a"
// Change to "b": "Cleanup: a" → "Setup: b"
// Change to "c": "Cleanup: b" → "Setup: c"
// Unmount: "Cleanup: c"
```

### **Our Debounce Case**

```typescript
useEffect(() => {
  const timer = setTimeout(() => onChange(value), 300); // Start timer
  return () => clearTimeout(timer); // Finish (cancel) previous timer
}, [value]);

// Flow:
// Type "t": Start timer#1
// Type "a": Cleanup (cancel timer#1) → Start timer#2
// Type "b": Cleanup (cancel timer#2) → Start timer#3
// 300ms: timer#3 fires
```

### **Common Use Cases**

```typescript
// Timers
useEffect(() => {
  const timer = setTimeout(fn, 300);
  return () => clearTimeout(timer);
}, []);

// Event listeners
useEffect(() => {
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}, []);

// Subscriptions
useEffect(() => {
  const sub = observable.subscribe(handler);
  return () => sub.unsubscribe();
}, []);
```

---

## Question 4: Optional Chaining `onClear?.()` - Apa artinya?

### **Konsep**

`?.` = Optional chaining operator  
`?.()` = Optional function call

### **Meaning**

```typescript
onClear?.();
// = "Call onClear IF it exists, otherwise do nothing"

// Equivalent to:
if (onClear !== null && onClear !== undefined) {
  onClear();
}
```

### **Why We Use It**

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void; // ← OPTIONAL prop
}
```

`onClear` is optional because not every parent needs extra cleanup behavior.

### **Scenarios**

```typescript
// Parent provides onClear
<SearchInput
  value={value}
  onChange={setValue}
  onClear={() => inputRef.current?.blur()}  // ✅ Executes
/>

// Parent doesn't provide onClear
<SearchInput
  value={value}
  onChange={setValue}
  // onClear omitted
/>  // ✅ No error, just skips the call
```

### **Implementation**

```typescript
const handleClear = () => {
  setInternalValue(""); // Clear local state
  onChange(""); // Clear parent state
  onClear?.(); // Call IF exists, skip IF not
};
```

### **More Examples**

```typescript
// Property access
user?.profile?.name; // Get name if user and profile exist

// Array access
arr?.[0]; // Get first element if array exists

// Method call
obj?.method?.(); // Call method if obj and method exist

// Combination
user?.getProfile?.()?.name; // Chain multiple optional calls
```

### **Return Value**

```typescript
const result = onClear?.();

// If onClear exists: returns whatever onClear() returns
// If onClear is null/undefined: returns undefined
```

---

## 🎯 Summary Table

| Topic                 | Key Concept                          | Use Case                                            |
| --------------------- | ------------------------------------ | --------------------------------------------------- |
| **forwardRef**        | Teruskan ref ke DOM element di child | Focus management, keyboard shortcuts                |
| **Debounce**          | Tunggu user selesai, execute once    | Search, form validation, window resize              |
| **useEffect Cleanup** | Finish previous before starting new  | Cancel timers, remove listeners, cleanup resources  |
| **Optional Chaining** | Safe access/call if exists           | Optional callbacks, nested objects, prevent crashes |

---

**Date:** 2024-02-02  
**Component:** SearchInput.tsx  
**Context:** Yomeru App - Japanese vocabulary learning app  
**Author:** Personal documentation by Rizky
