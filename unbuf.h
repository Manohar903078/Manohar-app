/* Makes printf output appear immediately, so prompts show before scanf waits for input */
#include <stdio.h>
__attribute__((constructor)) static void lc_unbuffer_streams(void)
{
    setvbuf(stdout, NULL, _IONBF, 0);
    setvbuf(stderr, NULL, _IONBF, 0);
}
