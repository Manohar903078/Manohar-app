/* Learn C - chat box. Works OFFLINE (searches the app's own notes, Q&A and programs).
   If the server has an AI key and the phone is online, it asks the AI too (optional). */
(function () {
  const css = `#aiFab{position:fixed;right:16px;bottom:88px;width:56px;height:56px;border-radius:50%;border:0;background:linear-gradient(135deg,var(--accent2),var(--accent));color:#fff;font-size:26px;box-shadow:0 8px 22px rgba(0,0,0,.35);z-index:60;cursor:pointer;display:grid;place-items:center}
#aiBox{position:fixed;left:0;right:0;bottom:0;top:10%;background:var(--bg);color:var(--text);z-index:70;border-radius:24px 24px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.45);display:none;flex-direction:column;max-width:560px;margin:0 auto}
#aiBox.on{display:flex}
#aiHead{display:flex;align-items:center;gap:10px;padding:14px 16px;font-weight:700;background:var(--card);border-radius:24px 24px 0 0}
#aiHead span{flex:1}#aiHead small{font-weight:500;color:var(--mute);margin-left:6px}#aiHead button{width:36px;height:36px;border-radius:50%;border:0;background:var(--card2);color:var(--text);font-size:16px}
#aiMsgs{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.aiM{max-width:90%;padding:10px 14px;border-radius:18px;line-height:1.55;font-size:15px;overflow-wrap:anywhere}
.aiM.u{align-self:flex-end;background:linear-gradient(135deg,var(--accent2),var(--accent));color:#fff}
.aiM.a{align-self:flex-start;background:var(--card)}
.aiM pre{background:var(--code);color:#f5e9ff;padding:10px;border-radius:12px;overflow:auto;margin:8px 0;white-space:pre;font:13px/1.5 Consolas,monospace}
.aiM p{margin:0 0 8px}.aiM small{color:var(--mute)}
.aiC{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.aiC button{border:0;border-radius:99px;padding:7px 12px;background:var(--card2);color:var(--text);font-size:13px}
#aiForm{display:flex;gap:8px;padding:12px;background:var(--card)}
#aiIn{flex:1;border:0;border-radius:99px;padding:12px 16px;background:var(--card2);color:var(--text);font-size:15px;outline:0}
#aiSend{border:0;border-radius:99px;padding:0 18px;background:linear-gradient(135deg,var(--accent2),var(--accent));color:#fff;font-weight:700}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const fab = document.createElement("button"); fab.id = "aiFab"; fab.textContent = "💬"; fab.setAttribute("aria-label", "Ask");
  const box = document.createElement("div"); box.id = "aiBox";
  box.innerHTML = '<div id="aiHead"><span>✨ Ask Learn C<small id="aiSt"></small></span><button id="aiClr" title="Clear">🗑</button><button id="aiX">✕</button></div><div id="aiMsgs"></div><form id="aiForm"><input id="aiIn" placeholder="Ask anything about C…" autocomplete="off"><button id="aiSend">Send</button></form>';
  document.body.append(fab, box);
  const $m = box.querySelector("#aiMsgs"), $i = box.querySelector("#aiIn"), $s = box.querySelector("#aiSt");
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const fmt = (t) => esc(t).replace(/```(?:\w+)?\n?([\s\S]*?)```/g, "<pre>$1</pre>").replace(/\n/g, "<br>").replace(/<pre>([\s\S]*?)<\/pre>/g, (m) => m.replace(/<br>/g, "\n"));
  const add = (cls, html) => { const d = document.createElement("div"); d.className = "aiM " + cls; d.innerHTML = html; $m.appendChild(d); $m.scrollTop = $m.scrollHeight; return d; };
  const status = () => { $s.textContent = navigator.onLine ? " · online" : " · offline"; };
  addEventListener("online", status); addEventListener("offline", status); status();

  const FAQ = [
  ["c language what history dennis ritchie developed","C is a general-purpose, structured, middle-level programming language developed by Dennis Ritchie at Bell Labs in 1972. It was used to write the UNIX operating system. C is fast, portable and close to hardware, so it is used for operating systems, embedded systems and compilers."],
  ["compiler interpreter difference","Compiler translates the WHOLE program at once and shows all errors as a list; it creates an .exe file and is faster to run. Interpreter translates and runs LINE BY LINE, stops at the first error, creates no .exe and is slower. C uses a compiler; Python uses an interpreter."],
  ["compiler","A compiler is software that translates a high-level program (like C) into machine code in one go. If there are errors it shows them all; if not, it creates an executable (.exe) file that can be run many times."],
  ["interpreter","An interpreter translates a program line by line and runs each line immediately. It stops where the first error occurs and does not create an .exe file, so it is slower than a compiler. Python is an example."],
  ["assembler assembly language","Assembly language uses short symbols (mnemonics) like ADD, MOV instead of 0s and 1s. An assembler converts assembly code into machine code."],
  ["machine language binary","Machine language is the only language a computer understands directly. It consists of 0s and 1s (binary). It is hard for humans, so we use assembly and high-level languages."],
  ["algorithm","An algorithm is a step-by-step procedure to solve a problem, written in simple language. Example (sum of two numbers): 1. Start 2. Read a, b 3. sum = a + b 4. Print sum 5. Stop."],
  ["flowchart symbols","A flowchart is a diagram of an algorithm. Oval = Start/Stop, Parallelogram = Input/Output, Rectangle = Process, Diamond = Decision (yes/no), Circle = Connector, Arrow = Flow direction."],
  ["program development steps phases","Steps in program development: 1. Problem definition 2. Problem analysis and design 3. Algorithm 4. Flowchart 5. Coding 6. Debugging and testing 7. Documentation."],
  ["error types syntax logical runtime","Syntax error: breaking the language rules (e.g., missing ;) - found at compile time. Run-time error: error while running (e.g., divide by zero). Logical error: program runs but gives wrong output (e.g., using - instead of +) - hardest to find."],
  ["debugging","Debugging is finding and correcting errors (bugs) in a program. The 3 error types are syntax, run-time and logical errors."],
  ["software hardware difference","Hardware = physical parts you can touch (keyboard, mouse, monitor). Software = programs that make the hardware work (Windows, Android, WhatsApp). Software is of two types: system software and application software."],
  ["operating system os","The Operating System (OS) is system software that acts as an interface between the user and the computer hardware and manages its resources. Examples: Windows, Linux, Android, iOS."],
  ["main function","main() is the starting point of every C program; execution always begins from main(). A C program must have exactly one main().\n```\n#include <stdio.h>\nint main(void)\n{\n    printf(\"Hello\");\n    return 0;\n}\n```"],
  ["header file stdio conio include","Header files (.h) contain ready-made functions. #include <stdio.h> gives printf(), scanf(); <conio.h> gives clrscr(), getch() (Turbo C); <math.h> gives sqrt(), pow(); <string.h> gives strlen(), strcpy(); <stdlib.h> gives malloc(), free(). #include <file.h> searches system folders; #include \"file.h\" searches the current folder first."],
  ["structure c program","A C program has these parts: Documentation (comments), Link section (#include), Definition section (#define), Global declarations, main() function (local declarations + statements), and Sub-programs (user-defined functions)."],
  ["comment comments","Comments are notes for humans and are ignored by the compiler. Single line: // comment. Multi line: /* comment */."],
  ["printf","printf() prints output on the screen. It belongs to stdio.h.\n```\nint age = 20;\nprintf(\"Age = %d\", age);\n```\nThe %d is a format specifier replaced by the value of age."],
  ["scanf input","scanf() reads input from the keyboard (stdio.h). Always use & before the variable (except strings).\n```\nint a;\nscanf(\"%d\", &a);\n```\nIt returns the number of values read successfully."],
  ["format specifier","Format specifiers tell printf/scanf the data type: %d int, %f float, %lf double, %c char, %s string, %u unsigned int, %ld long, %x hexadecimal, %o octal."],
  ["escape sequence","Escape sequences start with \\ and do special jobs: \\n new line, \\t tab, \\b backspace, \\r carriage return, \\a bell (beep), \\\" double quote, \\' single quote, \\\\ backslash, \\0 null."],
  ["new line n escape","\\n is the new line escape sequence. printf(\"Hi\\nHello\"); prints Hi and Hello on two lines."],
  ["keyword","Keywords are reserved words of C with fixed meaning (int, float, if, else, for, while, return, ...). There are 32 keywords, all in lowercase, and you cannot use them as variable names."],
  ["identifier rules name variable naming","Identifier rules: must start with a letter or underscore (not a digit); only letters, digits and _ allowed; no spaces or special symbols; cannot be a keyword; case sensitive (Sum and sum are different). Valid: sum, _temp, emp_name. Invalid: 5n, emp no, id-no, int."],
  ["variable","A variable is a named memory location whose value can change. You must declare it with a data type before using it.\n```\nint age = 20;\nfloat price = 42.5;\nchar grade = 'A';\n```"],
  ["constant constants types","Constants are fixed values that do not change. Types: Integer (10), Real (3.14), Character ('A', single quote), String (\"Ravi\", double quote). Use const or #define to make named constants."],
  ["define const difference","#define PI 3.14 is replaced by the preprocessor before compiling (no memory, no type). const float pi = 3.14; is a real variable with a type that cannot be changed. const is safer."],
  ["data type types primary","Data types tell what kind of data a variable stores. Primary: int, char, float, double. User defined: enum, typedef. Derived: array, pointer, structure. void means empty. Qualifiers: short, long, signed, unsigned."],
  ["int float char double size bytes memory","Typical sizes: char 1 byte, int 4 bytes (2 in old Turbo C), float 4 bytes, double 8 bytes. Use sizeof(type) to see the size on your computer."],
  ["sizeof","sizeof is an operator that gives the size of a data type or variable in bytes. printf(\"%d\", sizeof(int)); prints 4 on modern compilers."],
  ["typedef","typedef gives a new name to an existing data type.\n```\ntypedef unsigned int uint;\nuint x = 10;\n```"],
  ["enum","enum creates a list of named integer constants starting from 0.\n```\nenum day { MON, TUE, WED };   // MON=0, TUE=1, WED=2\nenum day d = TUE;\n```"],
  ["type casting conversion","Type casting converts one data type to another. Example: float f = (float)a / b; makes the division a real division. Without the cast, 5/2 gives 2 (integer division) and with the cast you get 2.5."],
  ["operator types","C operators: Arithmetic (+ - * / %), Relational (< > <= >= == !=), Logical (&& || !), Bitwise (& | ^ ~ << >>), Assignment (= += -=), Unary (++ -- -), Conditional (? :), and special ones (sizeof, comma)."],
  ["modulus remainder percent operator","The % operator gives the remainder of a division. 10 % 3 = 1. It works only with integers. It is used to check even/odd (n % 2) and in digit programs."],
  ["increment decrement pre post ++ --","++ adds 1, -- subtracts 1. Pre-increment (++a) increases first, then uses the value. Post-increment (a++) uses the value first, then increases.\n```\nint a = 5;\nprintf(\"%d\", a++);  // prints 5, a becomes 6\nprintf(\"%d\", ++a);  // a becomes 7, prints 7\n```"],
  ["assignment equality = == difference","= is the assignment operator (puts a value in a variable). == is the equality operator (compares two values). if (a = 5) assigns 5 (a common mistake); if (a == 5) compares."],
  ["logical operators and or not","&& (AND) is true only if both conditions are true; || (OR) is true if at least one is true; ! (NOT) reverses the result. Example: if (age >= 18 && hasCard) vote."],
  ["ternary conditional operator","The conditional (ternary) operator ? : is a short if-else.\n```\nmax = (a > b) ? a : b;\n```\nIf a > b the value after ? is used, otherwise the value after :."],
  ["bitwise operators","Bitwise operators work on bits: & AND, | OR, ^ XOR, ~ NOT, << left shift (multiplies by 2), >> right shift (divides by 2). Example: 5 & 3 = 1, 5 | 3 = 7, 5 ^ 3 = 6."],
  ["operator precedence associativity","Precedence decides which operator is evaluated first: () first, then unary (++ -- !), then * / %, then + -, then relational, then == !=, then &&, then ||, then ?:, then =. Associativity decides the direction when precedence is equal (mostly left to right; assignment is right to left)."],
  ["if else statement decision","if-else makes a decision.\n```\nif (marks >= 35)\n    printf(\"Pass\");\nelse\n    printf(\"Fail\");\n```\nVariants: simple if, if-else, else-if ladder, nested if."],
  ["switch case statement","switch selects one of many options by value. Use break to stop falling into the next case, and default for no match.\n```\nswitch (day) {\n  case 1: printf(\"Mon\"); break;\n  case 2: printf(\"Tue\"); break;\n  default: printf(\"Other\");\n}\n```"],
  ["switch if else difference","switch compares ONE variable against constant values (int/char) and is cleaner for many fixed choices. if-else can test any condition, ranges and floats, and logical combinations."],
  ["loop types looping statements","C has 3 loops: for (when the number of repetitions is known), while (checks the condition first, may run 0 times), do-while (runs the body at least once, then checks the condition)."],
  ["while do difference","while is an entry-controlled loop: it checks the condition FIRST, so the body may run zero times. do-while is an exit-controlled loop: it runs the body FIRST and checks later, so it runs at least once. do-while ends with a semicolon.\n```\nwhile (i <= 5) { i++; }\ndo { i++; } while (i <= 5);\n```"],
  ["for loop","for loop repeats a block a known number of times: for (initialization; condition; update).\n```\nfor (i = 1; i <= 5; i++)\n    printf(\"%d \", i);\n```\nOutput: 1 2 3 4 5"],
  ["while loop","while repeats while the condition is true. The condition is checked before every run.\n```\nint i = 1;\nwhile (i <= 5) {\n    printf(\"%d \", i);\n    i++;\n}\n```"],
  ["do while loop","do-while runs the body once first, then checks the condition, so it executes at least one time.\n```\nint i = 1;\ndo {\n    printf(\"%d \", i);\n    i++;\n} while (i <= 5);\n```"],
  ["infinite loop","An infinite loop never stops because its condition is always true: while(1) { ... } or for(;;). Use break to come out of it."],
  ["break continue difference","break immediately exits the loop (or switch). continue skips the rest of the current iteration and goes to the next iteration of the loop."],
  ["goto","goto jumps to a labelled statement: goto end; ... end: printf(\"done\"); It is not recommended because it makes programs hard to read."],
  ["nested loop","A loop inside another loop is a nested loop. The inner loop completes fully for each run of the outer loop. Used for patterns and 2D arrays.\n```\nfor (i = 1; i <= 3; i++) {\n  for (j = 1; j <= i; j++) printf(\"* \");\n  printf(\"\\n\");\n}\n```"],
  ["array","An array is a collection of elements of the SAME data type stored in continuous memory under one name. Index starts from 0.\n```\nint a[5] = {10, 20, 30, 40, 50};\nprintf(\"%d\", a[2]);   // 30\n```"],
  ["two dimensional array matrix 2d","A 2D array stores data in rows and columns (a matrix): int m[3][3]; Access with m[row][col]. Use two nested loops to read or print it."],
  ["string","A string is an array of characters ending with the null character '\\0'.\n```\nchar name[20] = \"Ravi\";\nprintf(\"%s\", name);\n```\nRead a word with scanf(\"%s\", name) and a full line with gets()/fgets()."],
  ["string functions strlen strcpy strcat strcmp","string.h functions: strlen(s) length, strcpy(dest, src) copy, strcat(s1, s2) join, strcmp(s1, s2) compare (0 if equal), strrev(s) reverse (Turbo C), strlwr/strupr change case."],
  ["pointer","A pointer is a variable that stores the memory ADDRESS of another variable. & gives the address, * gives the value at that address.\n```\nint a = 10;\nint *p = &a;\nprintf(\"%d\", *p);   // 10\n```"],
  ["null pointer","A null pointer points to nothing (address 0): int *p = NULL; Always check if (p != NULL) before using a pointer. Dereferencing NULL crashes the program."],
  ["dangling wild pointer","A dangling pointer points to memory that was already freed or is out of scope. A wild pointer is not initialized at all. Both are dangerous; set pointers to NULL after free()."],
  ["pointer arithmetic","Adding 1 to a pointer moves it to the next element of its type (p + 1 moves by sizeof(int) bytes for an int pointer). That is how you walk through an array with a pointer."],
  ["call by value reference address difference","Call by value passes a COPY of the variable, so the original does not change. Call by reference passes the ADDRESS (pointer), so the function can change the original. Swap function needs call by reference:\n```\nvoid swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }\nswap(&x, &y);\n```"],
  ["function","A function is a block of code that performs a task and can be reused. Parts: declaration (prototype), definition, call.\n```\nint add(int a, int b) { return a + b; }\nint main(void) { printf(\"%d\", add(2, 3)); return 0; }\n```"],
  ["recursion","Recursion means a function calls itself. It needs a base condition to stop.\n```\nint fact(int n) {\n    if (n <= 1) return 1;\n    return n * fact(n - 1);\n}\n```"],
  ["void","void means 'nothing'. A void function returns no value; void * is a generic pointer; main(void) means no arguments."],
  ["storage class auto register static extern","C has 4 storage classes: auto (default for local variables, lives inside the block), register (asks to keep the variable in a CPU register), static (keeps its value between function calls; lifetime is the whole program), extern (refers to a global variable defined elsewhere)."],
  ["static variable","A static variable keeps its value between function calls and is initialized only once.\n```\nvoid count() { static int c = 0; c++; printf(\"%d \", c); }\n```\nCalling count() three times prints 1 2 3."],
  ["local global variable scope","A local variable is declared inside a function/block and exists only there. A global variable is declared outside all functions and can be used by every function. Scope = where a variable can be used; lifetime = how long it exists."],
  ["structure struct","A structure groups variables of DIFFERENT types under one name.\n```\nstruct student { int roll; char name[20]; float marks; };\nstruct student s1 = {1, \"Ravi\", 85.5};\nprintf(\"%s\", s1.name);\n```\nMembers are accessed with the dot (.) operator, or -> with a pointer."],
  ["structure union difference","In a structure every member has its own memory, so size = sum of members. In a union all members share the SAME memory, so size = largest member and only one member holds a value at a time."],
  ["union","A union is like a structure but all members share the same memory location, so it saves memory; only one member can be used at a time. Declared with the union keyword."],
  ["dynamic memory allocation malloc calloc realloc free","Dynamic memory is allocated at run time from the heap (stdlib.h). malloc(size) gives raw memory; calloc(n, size) gives zero-initialized memory; realloc(ptr, newsize) changes the size; free(ptr) releases it.\n```\nint *p = (int *)malloc(5 * sizeof(int));\nif (p == NULL) return 1;\nfree(p);\n```"],
  ["malloc calloc difference","malloc(size) allocates one block and the contents are garbage. calloc(n, size) allocates n blocks and sets everything to zero. Both return NULL if memory is not available."],
  ["memory leak","A memory leak happens when memory is allocated with malloc/calloc but never released with free(), so it stays used until the program ends."],
  ["file handling fopen fclose","File handling uses FILE *fp. fopen(name, mode) opens, fclose(fp) closes. Modes: \"r\" read, \"w\" write (erases), \"a\" append. Functions: fprintf, fscanf, fgets, fputs, fgetc, fputc.\n```\nFILE *fp = fopen(\"a.txt\", \"w\");\nfprintf(fp, \"Hello\");\nfclose(fp);\n```"],
  ["command line arguments argc argv","Command line arguments are given when running the program: int main(int argc, char *argv[]). argc = number of arguments, argv = array of the argument strings; argv[0] is the program name."],
  ["preprocessor directive macro","Preprocessor directives start with # and run before compilation: #include (add a file), #define (macro/constant), #ifdef / #endif (conditional compilation). Example: #define SQUARE(x) ((x)*(x))"],
  ["palindrome","A palindrome reads the same forwards and backwards (e.g., 121, madam). For numbers: reverse the number and compare it with the original."],
  ["armstrong","An Armstrong number equals the sum of its digits each raised to the power of the number of digits. Example: 153 = 1^3 + 5^3 + 3^3."],
  ["segmentation fault","A segmentation fault happens when a program accesses memory it is not allowed to, e.g., dereferencing a NULL/uninitialized pointer, going out of array bounds, or using freed memory."],
  ["array out of bounds","C does not check array limits. Writing a[10] in an array of size 5 gives undefined behaviour (garbage values or a crash). Valid indexes are 0 to size-1."],
  ["gets fgets difference","gets() reads a line but cannot limit the size, so it is unsafe and removed from new C standards. fgets(buf, size, stdin) is safe because it limits how many characters are read."],
  ["return statement return 0","return sends a value back from a function and ends it. return 0; in main() tells the operating system that the program ended successfully."],
  ["clrscr getch","clrscr() clears the screen and getch() waits for a key press - both are in conio.h and work in Turbo C only, not in modern compilers like gcc."],
  ["hello world program","The simplest C program:\n```\n#include <stdio.h>\nint main(void)\n{\n    printf(\"Hello, World!\");\n    return 0;\n}\n```"]
  ,["binary tree","A binary tree is a data structure where each node has at most two children: left and right.\n```\nstruct node { int data; struct node *left, *right; };\n```\nA binary SEARCH tree keeps smaller values on the left and larger on the right, so searching is fast."],
  ["linked list","A linked list is a chain of nodes; each node holds data and a pointer to the next node. Unlike arrays, its size can grow or shrink at run time (using malloc).\n```\nstruct node { int data; struct node *next; };\n```"],
  ["stack","A stack is a LIFO (Last In, First Out) structure. Push adds on top, pop removes from the top - like a pile of plates. Used in recursion, undo, expression evaluation."],
  ["queue","A queue is a FIFO (First In, First Out) structure. Enqueue adds at the rear, dequeue removes from the front - like a line at a ticket counter."],
  ["data structure","A data structure is a way of organizing data in memory so it can be used efficiently: arrays, linked lists, stacks, queues, trees and graphs."],
  ["sorting bubble selection insertion","Sorting arranges data in order. Bubble sort repeatedly swaps adjacent elements that are in the wrong order. Selection sort picks the smallest element and puts it in place each pass. Insertion sort inserts each element into its correct place among the sorted ones."],
  ["bubble sort","Bubble sort compares neighbouring elements and swaps them if they are in the wrong order; after each pass the largest element goes to the end.\n```\nfor (i = 0; i < n-1; i++)\n  for (j = 0; j < n-1-i; j++)\n    if (a[j] > a[j+1]) { t = a[j]; a[j] = a[j+1]; a[j+1] = t; }\n```"],
  ["searching linear binary search","Linear search checks each element one by one (works on any array). Binary search works only on a SORTED array: it compares with the middle element and discards half each time, so it is much faster."],
  ["time complexity big o","Time complexity tells how the running time grows with input size n. O(1) constant, O(log n) binary search, O(n) linear search, O(n log n) good sorting, O(n^2) bubble sort."],
  ["bit byte","A bit is the smallest unit of data: 0 or 1. A byte is 8 bits. 1 KB = 1024 bytes, 1 MB = 1024 KB."],
  ["ascii","ASCII gives every character a number: 'A' = 65, 'a' = 97, '0' = 48, space = 32. In C, a char is really a small integer: printf(\"%d\", 'A'); prints 65."],
  ["token","A token is the smallest element of a C program. The 5 types are: keywords, identifiers, constants, operators and special characters."],
  ["literal","A literal is a fixed value written directly in code: 10 (integer), 3.14 (real), 'A' (character), \"Hello\" (string)."],
  ["lvalue rvalue","An lvalue is something that has a memory address and can be on the left of = (like a variable x). An rvalue is a value that can only be on the right (like 5 or a + b)."],
  ["ide","An IDE (Integrated Development Environment) is software with an editor, compiler and debugger in one place, such as Code::Blocks, Dev-C++, Turbo C or VS Code."],
  ["gcc turbo c compiler","Turbo C is an old DOS compiler/IDE used in many colleges. GCC is the modern free compiler (used in Linux and Code::Blocks). The online compiler in this app also uses gcc."],
  ["object code linker","The compiler converts source code (.c) into object code (.obj). The linker joins the object code with library files and creates the executable file (.exe), which is then run."],
  ["preprocessor","The preprocessor runs before compilation. It handles lines starting with #: #include adds files, #define creates macros, #ifdef/#endif compile code conditionally."],
  ["macro function difference","A macro (#define) is replaced by text before compilation - no function call, faster, but no type checking. A function is a real call with type checking and it is safer. Example macro: #define SQUARE(x) ((x)*(x))"],
  ["function prototype declaration","A function prototype (declaration) tells the compiler the function's name, return type and parameters before it is used: int add(int, int); The definition with the body can come later."],
  ["function types category","By arguments and return value, functions are of 4 kinds: no arguments no return, with arguments no return, no arguments with return, and with arguments with return."],
  ["actual formal parameters arguments","Actual arguments are the values you pass when calling a function: add(2, 3). Formal parameters are the variables in the function definition that receive them: int add(int a, int b)."],
  ["function pointer","A function pointer stores the address of a function, so you can call a function through it: int (*fp)(int, int) = add; fp(2, 3);"],
  ["array of pointers","An array of pointers holds addresses, for example an array of strings: char *names[3] = {\"Ravi\", \"Sita\", \"Hari\"};"],
  ["pointer array relation","An array name is the address of its first element, so a[i] is the same as *(a + i). You can walk through an array with a pointer: int *p = a; p++ moves to the next element."],
  ["const pointer","const int *p: you cannot change the value through p, but p can point elsewhere. int *const p: p cannot point elsewhere, but the value can change."],
  ["volatile","volatile tells the compiler that a variable can change at any time outside the program (for example by hardware), so it must not be optimized away."],
  ["register","register asks the compiler to keep a variable in a CPU register for fast access (usually loop counters). You cannot take the address (&) of a register variable."],
  ["extern","extern declares a global variable that is defined in another file or later in the file, so it can be shared: extern int count;"],
  ["heap stack memory","Stack memory holds local variables and function calls; it is automatic and limited. Heap memory is used for dynamic allocation (malloc/calloc); you must free it yourself."],
  ["stack overflow","Stack overflow happens when the stack memory is used up, usually by infinite or very deep recursion without a base condition."],
  ["garbage value","A local variable that is not initialized contains a garbage (random leftover) value. Always initialize variables: int a = 0;"],
  ["undefined behaviour","Undefined behaviour means the C standard does not say what happens: e.g., array out of bounds, dereferencing NULL, using an uninitialized variable, i = i++ + ++i. The program may crash or print anything."],
  ["integer overflow","Integer overflow happens when a value goes beyond the data type's range (for example int max 2147483647 + 1), and the result wraps around to a wrong value. Use a bigger type like long long."],
  ["float precision double","float keeps about 6 digits of precision and double about 15. That is why 0.1 + 0.2 may not be exactly 0.3. Use double for accurate calculations."],
  ["integer division","In C, dividing two integers gives an integer: 5 / 2 = 2. For a real result make one operand float: 5 / 2.0 = 2.5."],
  ["short circuit","With && and ||, C stops evaluating as soon as the result is known: in (a && b) if a is false, b is not evaluated; in (a || b) if a is true, b is not evaluated."],
  ["comma operator","The comma operator evaluates expressions left to right and gives the value of the last one: x = (1, 2, 3); makes x = 3. It is often used in for loops: for (i = 0, j = 10; i < j; i++, j--)"],
  ["getchar putchar puts","getchar() reads one character, putchar(c) prints one character, puts(s) prints a string followed by a new line, gets(s) reads a line. All are in stdio.h."],
  ["math functions sqrt pow","math.h has: sqrt(x) square root, pow(x, y) x to the power y, abs(n) / fabs(x) absolute value, ceil(x), floor(x), sin, cos, tan, log, exp. Link with -lm on some compilers."],
  ["atoi string number conversion","stdlib.h has atoi(\"123\") to convert a string to int, atof() to float, and rand() for random numbers, exit() to end the program."],
  ["rand random","rand() (stdlib.h) gives a random number. Call srand(time(NULL)); once first (time.h) so you get a different sequence every run. rand() % 10 gives 0 to 9."],
  ["bit field","A bit field lets you use a fixed number of bits for a structure member: struct flags { unsigned a : 1; unsigned b : 3; }; It saves memory."],
  ["structure padding","The compiler may add empty bytes between structure members so they are aligned in memory. That is why sizeof a structure can be larger than the sum of its members."],
  ["nested structure","A structure inside another structure is a nested structure: struct student { int roll; struct date { int d, m, y; } dob; }; Access with s.dob.y."],
  ["array of structures","An array of structures stores many records: struct student s[50]; Use s[i].name to access the i-th student's name."],
  ["structure pointer arrow","With a pointer to a structure use the arrow operator: struct student *p = &s1; p->roll is the same as (*p).roll."],
  ["static function global","A static global variable or function is visible only inside its own file; this hides it from other files."],
  ["scope lifetime","Scope is the region where a name can be used (block, function, file). Lifetime is how long the variable exists in memory. A static local variable has block scope but program lifetime."],
  ["fflush buffer","fflush(stdin) / getchar() are used to clear leftover characters (like the Enter key) from the input buffer, for example before reading a char with scanf(\"%c\") after a number. Use scanf(\" %c\") (with a space) as a simple fix."],
  ["scanf space char problem","After scanf(\"%d\") the Enter key stays in the buffer and the next scanf(\"%c\") reads it. Fix it by putting a space before %c: scanf(\" %c\", &ch);"],
  ["even odd","A number is even if n % 2 == 0, otherwise it is odd."],
  ["swap two numbers","Swap using a temporary variable: t = a; a = b; b = t; Without a temp: a = a + b; b = a - b; a = a - b;"],
  ["prime number","A prime number has exactly two factors: 1 and itself (2, 3, 5, 7...). Check by dividing n by every number from 2 to n/2 (or sqrt(n)); if any divides it exactly, it is not prime."],
  ["fibonacci","The Fibonacci series: 0 1 1 2 3 5 8 13 ... Each term is the sum of the previous two."],
  ["factorial","n! = n x (n-1) x ... x 1, and 0! = 1. Example 5! = 120."],
  ["gcd lcm","GCD (HCF) is the largest number that divides both numbers (Euclid: while (b != 0) { t = b; b = a % b; a = t; }). LCM = (a x b) / GCD."],
  ["reverse number string","To reverse a number: repeatedly take the last digit (n % 10), add it to rev = rev * 10 + digit, and remove it with n = n / 10. To reverse a string swap characters from both ends."],
  ["pattern star pyramid","Pattern programs use nested loops: the outer loop is for rows and the inner loop for columns (stars/numbers per row). Example right triangle: row i prints i stars."]
  ,
  ["pointer double triple","A pointer to pointer (double pointer) stores the address of another pointer: int a = 10; int *p = &a; int **pp = &p; Then *pp is p and **pp is the value 10."]
];
  
  // ---------- local knowledge index ----------
  const STOP = new Set("a an the is are was were be to of in on for and or what whats how why when which who does did can could i me my you your it its this that with as at by from about tell explain give show define meaning mean means ante enti emiti ela cheppu cheppandi chepandi ra kosam oka lo ni ki tho kada please pls plz c language".split(" "));
  const SYN = { pointers: "pointer", arrays: "array", strings: "string", loops: "loop", functions: "function", structures: "structure", structs: "structure", struct: "structure", malloc: "dynamic", calloc: "dynamic", realloc: "dynamic", compile: "compiler", compiling: "compiler", compilation: "compiler", interpret: "interpreter", variables: "variable", operators: "operator", keywords: "keyword", constants: "constant", identifiers: "identifier", datatype: "data", datatypes: "data", types: "type", recursive: "recursion", prime: "prime", fibonacci: "fibonacci", fibonaci: "fibonacci", factorial: "factorial", palindrome: "palindrome", armstrong: "armstrong", reverse: "reverse", swap: "swap", sorting: "sort", sorted: "sort", searching: "search" };
  const tok = (t) => String(t).toLowerCase().replace(/\+\+/g, " increment ").replace(/--/g, " decrement ").replace(/==/g, " equality ").replace(/[^a-z0-9_%#\s]/g, " ").split(/\s+/).filter(Boolean).map((w) => SYN[w] || (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
  let IDX = null, loading = null;
  function build(th, iq, ia, pr) {
    const docs = [], df = new Map();
    const push = (d) => { d.t = new Set(tok(d.text).filter((w) => !STOP.has(w))); d.t.forEach((w) => df.set(w, (df.get(w) || 0) + 1)); docs.push(d); };
    (th || []).forEach((t) => {
      const root = new DOMParser().parseFromString("<div>" + t.html + "</div>", "text/html").body.firstChild; let cur = null;
      const flush = () => { if (cur && (cur.body.length || cur.code)) { cur.text = t.title + " " + cur.head + " " + cur.body.join(" "); push(cur); } };
      const start = (h) => { flush(); cur = { k: "th", topic: t.id, title: t.title, head: h, body: [], code: "" }; };
      start("");
      [...root.children].forEach((el) => {
        if (el.tagName === "H4") start(el.textContent.trim());
        else if (el.tagName === "PRE") { if (!cur.code) cur.code = el.textContent; cur.body.push(el.textContent.replace(/\s+/g, " ").slice(0, 200)); }
        else cur.body.push(el.textContent.replace(/(\|\s*-{2,}\s*)+\|?/g, "").replace(/\|\|/g, "\n").trim());
      });
      flush();
    });
    ((iq && iq.items) || []).forEach((x) => push({ k: "iq", id: x.id, q: x.q, text: x.q, ans: ia ? ia[x.id] : "" }));
    (pr || []).forEach((p) => push({ k: "pr", id: p.id, q: p.q, text: p.q, code: p.code, out: p.output, stdin: p.stdin }));
    return { docs, df, N: docs.length };
  }
  function load() {
    if (IDX) return Promise.resolve(IDX);
    if (loading) return loading;
    const g = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    return (loading = Promise.all([g("/data/theory.json"), g("/data/interview_q.json"), g("/data/interview_a.json"), g("/data/programs.json")]).then(([a, b, c, d]) => (IDX = build(a, b, c, d))));
  }
  const FQ = FAQ.map(([k, a]) => ({ k: new Set(tok(k).filter((w) => !STOP.has(w))), a }));
  function faqMatch(q) {
    if (/pointer\s+to\s+(a\s+)?pointer/i.test(q)) return FQ.find((e) => e.k.has("triple"));
    if (/^\s*(what is|what's|define|explain|about|tell me about)?\s*(the )?c( language| programming)?\s*[?.!]*\s*$/i.test(q)) return FQ[0];
    const qt = [...new Set(tok(q).filter((w) => !STOP.has(w)))]; if (!qt.length) return null;
    let best = null, bs = 0;
    for (const e of FQ) {
      const m = qt.filter((w) => e.k.has(w)).length; if (!m) continue;
      const cov = m / qt.length; if (cov < 0.6) continue;
      const sc = cov * 10 + m - e.k.size * 0.02; if (sc > bs) { bs = sc; best = e; }
    }
    return best;
  }
  function search(q, kind, n) {
    const qt = [...new Set(tok(q).filter((w) => !STOP.has(w)))]; if (!qt.length) return [];
    const res = [];
    for (const d of IDX.docs) {
      if (d.k !== kind) continue;
      let s = 0, hit = 0;
      for (const w of qt) if (d.t.has(w)) { s += Math.log(1 + IDX.N / (IDX.df.get(w) || 1)); hit++; }
      if (!hit) continue;
      s *= hit / qt.length; s /= Math.pow(d.t.size || 1, 0.25);
      if (kind !== "th" && d.text.toLowerCase().includes(qt.join(" "))) s *= 1.4;
      res.push({ d, s });
    }
    return res.sort((a, b) => b.s - a.s).slice(0, n);
  }
  const GENERIC = /learn its definition|being added|concept used to write correct|small compiled example|carefully defined|explain the purpose and behavior|compare their syntax|is a core c idea|state the rule|interview prompt|strong answer should|use the relevant c feature|how would you explain|validate input, check sizes/i;
  const DEFQ = /\b(what|enti|emiti|ante|meaning|define|definition|difference|vs|versus|explain|types|kinds)\b/i;
  const WANTPROG = /\b(program|code|write|example|output|sample|source|rayi|raayi|rasi)\b/i;
  const link = (fn, label) => `<div class="aiC"><button onclick="${fn}">${label}</button></div>`;
  const cut = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s);

  function localAnswer(q) {
    if (/^\s*(hi|hello|hey|namaste|namaskaram|hai)\b/i.test(q) && q.length < 25) return { html: "Hi! 😊 Ask me about any C topic, a definition, an interview question, or a program (for example: <i>pointer ante enti</i>, <i>compiler vs interpreter</i>, <i>factorial program</i>)." };
    const th = search(q, "th", 3), iq = search(q, "iq", 6).filter((x) => x.d.ans && !GENERIC.test(x.d.ans)), pr = search(q, "pr", 3);
    const fa = WANTPROG.test(q) ? null : faqMatch(q);
    if (fa) return { html: "<p>" + fmt(fa.a) + "</p>", chips: iq.filter((x) => x.s > 1.5).slice(0, 3).map((x) => x.d.q), ctx: fa.a };
    const wantP = WANTPROG.test(q), bt = th[0], bi = iq[0], bp = pr[0];
    const parts = [], chips = [];
    const showProg = bp && (wantP ? bp.s > 0.8 : !DEFQ.test(q) && bp.s > 3 && (!bi || bp.s > bi.s * 1.3) && (!bt || bp.s > bt.s * 1.3));
    if (showProg) {
      const p = bp.d;
      parts.push(`<p><b>${esc(p.q)}</b></p><pre>${esc(p.code)}</pre>` + (p.out ? `<p><small>Output${p.stdin ? " (input: " + esc(p.stdin.replace(/\n/g, ", ")) + ")" : ""}:</small></p><pre>${esc(p.out)}</pre>` : "") + link(`document.getElementById('aiX').click();go('prog',${p.id})`, "▶ Open &amp; run"));
      pr.slice(1, 3).forEach((x) => chips.push(x.d.q));
    }
    const goodI = bi && bi.s > 1.5 && bi.d.ans && !GENERIC.test(bi.d.ans) && (!bt || bi.s >= bt.s * 0.8 || bt.s < 2.5);
    if (!showProg && goodI) {
      parts.push(`<p><b>${esc(bi.d.q)}</b></p><p>${esc(bi.d.ans)}</p>`);
      iq.slice(1, 4).forEach((x) => chips.push(x.d.q));
    } else if (!showProg && bt && bt.s > 0.7) {
      const d = bt.d;
      parts.push(`<p><b>${esc(d.title)}${d.head ? " – " + esc(d.head) : ""}</b></p><p>${esc(cut(d.body.join("\n"), 650)).replace(/\n/g, "<br>")}</p>` + (d.code ? `<pre>${esc(d.code.slice(0, 600))}</pre>` : "") + link(`document.getElementById('aiX').click();go('topic',${d.topic})`, "📘 Open topic notes"));
      iq.filter((x) => x.s > 1.5).slice(0, 3).forEach((x) => chips.push(x.d.q));
    } else if (!showProg && bi && bi.s > 1.5) {
      parts.push(`<p><b>${esc(bi.d.q)}</b></p><p>Check the notes below, and try the related questions.</p>`);
      iq.slice(1, 4).forEach((x) => chips.push(x.d.q));
    }
    if (!parts.length) return { html: "I couldn't find that in the notes. Try simpler words, for example: <i>pointer</i>, <i>array</i>, <i>for loop</i>, <i>printf</i>, <i>factorial program</i>.", chips: ["What is a pointer?", "Compiler vs interpreter", "Fibonacci program"] };
    return { html: parts.join(""), chips: chips.slice(0, 3), ctx: th.slice(0, 2).map((x) => x.d.title + ": " + cut(x.d.body.join(" "), 700)).concat(iq.slice(0, 2).filter((x) => x.d.ans && !GENERIC.test(x.d.ans)).map((x) => x.d.q + " " + x.d.ans)).join("\n") };
  }

  // ---------- chat flow ----------
  let hist = [], busy = false;
  const chipsHtml = (c) => (c && c.length ? `<div class="aiC">${c.map((x) => `<button data-q="${esc(x).replace(/"/g, "&quot;")}">${esc(cut(x, 60))}</button>`).join("")}</div>` : "");
  const hello = () => add("a", "Hi! Ask me anything about C 😊<br><small>Works even without internet.</small>" + chipsHtml(["What is a pointer?", "Compiler vs interpreter", "Fibonacci program", "Escape sequences"]));
  hello();
  fab.onclick = () => { box.classList.add("on"); fab.style.display = "none"; load(); setTimeout(() => $i.focus(), 100); };
  box.querySelector("#aiX").onclick = () => { box.classList.remove("on"); fab.style.display = "grid"; };
  box.querySelector("#aiClr").onclick = () => { hist = []; $m.innerHTML = ""; hello(); };
  $m.addEventListener("click", (e) => { const b = e.target.closest("button[data-q]"); if (b) ask(b.dataset.q); });
  box.querySelector("#aiForm").onsubmit = (e) => { e.preventDefault(); const q = $i.value.trim(); $i.value = ""; if (q) ask(q); };
  async function ask(q) {
    if (busy) return; busy = true; add("u", esc(q));
    const t = add("a", "…");
    let loc; try { await load(); loc = IDX ? localAnswer(q) : { html: "Notes are not loaded yet. Connect to the internet once and open the app, then try again." }; } catch (e) { loc = { html: "Sorry, something went wrong." }; }
    t.innerHTML = loc.html + chipsHtml(loc.chips); $m.scrollTop = $m.scrollHeight;
    // optional online boost (only if the server has an AI key; otherwise silently stays with the offline answer)
    if (navigator.onLine) {
      hist.push({ role: "user", content: q });
      try {
        const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 12000);
        const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: hist, context: loc.ctx || "" }), signal: ctl.signal }); clearTimeout(to);
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.reply) { t.innerHTML = fmt(j.reply) + (loc.chips && loc.chips.length ? chipsHtml(loc.chips) : ""); hist.push({ role: "assistant", content: j.reply }); } else hist.pop();
      } catch { hist.pop(); }
    }
    busy = false; $m.scrollTop = $m.scrollHeight;
  }
})();
