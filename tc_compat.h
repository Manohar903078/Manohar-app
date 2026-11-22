/*............. Minimal Turbo-C compatibility so notes' programs (clrscr/getch) work on gcc............... */
#include <stdio.h>
#include <stdlib.h>
#ifndef TC_COMPAT_H
#define TC_COMPAT_H
#define clrscr() ((void)0)
#define getch() getchar()
#define getche() getchar()
#endif
