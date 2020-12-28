# Kaboom.

Another static site photo gallery.

**Fast/tiny startup bundle**  
The gallery focuses on quick load & first-paint.  Total bundle size is under 50kB (gzipped) -- with inline images included.

|                      |   raw     |    gzip   |    brotli   |
|----------------------|----------:|----------:|------------:|
|  index.html          |   3.8 kB  |   2.1 kB  |     1.3 kB  |
|  album-1-to-10.json  |  42.6 kB  |  15.1 kB  |    11.7 kB  |
|  album-basic.js      |  55.3 kB  |  19.8 kB  |    16.6 kB  |
|  bundle-basic.css    |   4.9 kB  |   1.7 kB  |     1.1 kB  |
|  **TOTAL**           |  **106.6 kB** |  **38.7 kB** |  **30.7 kB**  |

There are more files that load "below the fold", including the nav menu and images past the first 10 in an album.  But they load in a second wave and shouldn't affect the startup speed.

---

**Good Place Holders**  
The gallery makes tiny, good-looking inline placeholder images by using Michael Fogleman's amazing [Primitive](https://github.com/fogleman/primitive) library.  Images are rendered as simplified geometric mosaics, like this one. 

|    |
|:--:|
|![Demo Primitive](./src/dummy/demo.svg)|


