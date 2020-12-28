# Kaboom.
A tiny, fast static site photo gallery with a linear narrative display scheme.  Written in node.js and Svelte.

[Design Goals](#design-goals)  
[Installation](#installation)  
[Kaboom CLI](#cli-help)  
[Directory Structure](#directory-structure)  

<p><br /></p> 

<h3 id="design-goals">DESIGN GOALS</h3>

**Startup Bundle Size**  
The gallery focuses on quick load & first-paint.  Total bundle size is under 50kB (gzipped) -- with inline images included.  The last bit (inline images) is the kicker: delivering the first 10 browseable images, with lightbox and descriptions, in under 50k.

| Above the fold       |   raw     |    gzip   |    brotli   |
|----------------------|----------:|----------:|------------:|
|  index.html          |   3.8 kB  |   2.1 kB  |     1.3 kB  |
|  album-basic.js      |  55.3 kB  |  19.8 kB  |    16.6 kB  |
|  bundle-basic.css    |   4.9 kB  |   1.7 kB  |     1.1 kB  |
|  album-1-to-10.json  |  30.9 kB  |  14.0 kB  |    11.2 kB  |
|  **TOTAL**           | **94.9 kB** |  **37.6 kB** |  **30.2 kB**  |

There are more files that load "below the fold", including the nav menu (JS and CSS), and images past the first 10 in an album.  But these below-the-fold files arrive in a second phase and shouldn't affect startup speed.  

| Below the fold       |   raw     |    gzip   |    brotli   |
|----------------------|----------:|----------:|------------:|
|  nav-app.js          |  32.6 kB  |  11.4 kB  |     9.5 kB  |
|  bundle-nav.css      |   4.7 kB  |   2.0 kB  |     1.3 kB  |
|  album-11-plus.json  |  53.8 kB  |  23.0 kB  |    18.9 kB  |
|  **TOTAL**           | **91.1 kB** |  **36.4 kB** |  **29.7 kB**  |

To some extent, your mileage will vary concerning the size of the `album-1-to-10.json` file.  It depends on how much description text you include.  If you write a novel to accompany each image, the JSON is going to get bigger.

Similarly, size will vary quite a bit in the `album-11-plus.json` file.  It contains all the images past the first 10.  The estimate here is using a gallery with 30 total images, including two or three sentences of description with each.

Finally, these number are only concerned with the inline place-holder images that get the page on its feet.  Once the browser starts pulling down the "real" images, bandwidth shoots up.  

**Lazy Loading**  
Real images only load once they enter the viewport.  The "small" images (image panel up to 700px width) average about 75kB, while the "medium" images (loading on larger screens) average between 120 and 180kB.

The "large" version of any given image only loads when a user opens the lightbox.  And the original image generally doesn't load unless a user chooses to download.

---

**Good Place Holders**  
The gallery makes good-looking inline placeholder images by using Michael Fogleman's amazing [Primitive](https://github.com/fogleman/primitive) library.  The placeholder images are rendered as simplified geometric mosaics, like this one. 

![Demo Primitive](./src/dummy/demo.svg)

Place-holders are svg, made of 100 overlapping ovals.  The [Primitive](https://github.com/fogleman/primitive) library has many other options besides ovals, but I found that ovals look pretty good on a broad array of images, and they are VERY easy to compress.

---

**Narrative Focus**  
The gallery privileges description text.  It makes room for description, listing the text side-by side when the screen is wide enough.  

![Demo Gallery Snapshot](./src/dummy/demo-gallery-snapshot.jpg)

If you don't care about descriptions, this gallery might not be a good fit...?  But there are some layout settings to adjust this stuff.

---

**Simple Directories**  
The gallery keeps directories simple and flat as possible, with simple naming rules, to allow straightforward deployment by FTP or equivalent.  See the [directory structure section](#directory-structure) for details.

----
<p><br /></p> 

<h3 id="installation">INSTALLATION</h3>

In addition to node.js and npm, you will need to install two external libraries.

**Primitive**  
[https://github.com/fogleman/primitive](https://github.com/fogleman/primitive)  

**NConvert**  
[https://www.xnview.com/en/nconvert/](https://www.xnview.com/en/nconvert/)

Both Primitive and NConvert are available for Windows, Mac, Linux.

**Install kaboom**  
```
git clone https://github.com/mattsahr/kaboom.git
cd kaboom
npm install
npm link
```

Once you have kaboom installed and linked, you should be able to type this at the command line

```
$> kaboom
```

If kaboom installed correctly, you will see a short help file. ([more CLI details](#cli-help))  

Type this command to add a demo album:

```
kaboom init
```

After running "kaboom init", take a look at your /kaboom/ directory, you should see these directories (among others).

```
kaboom
 -- gallery-active
    -- demo-album
       -- __original
          -- kaboom_1_demo.png
          -- kaboom_2_demo.jpg
          -- kaboom_3_demo.jpeg
          -- kaboom_4_demo.gif
    -- favicon.png
 -- gallery-static
    -- favicon.png
```

Inside the "demo-album", the "__original" directory is where you put your original images.  To process these images and prep them for the server, run the "kaboom ingest" command.  
**NOTE** -- you must have **nconvert** and **primitive** installed for this step.

```
kaboom ingest demo-album
```

The ingest command makes various sizes of the source images, as well as a placeholder svg image, and then populates some JSON files with metadata about the images.  Once the ingest command has run, you should be able to run the server, and see your album.

```
kaboom serve
```

In a web browser, browse to http://localhost:2317

At this point, on the web page, you should be able to click in the "Description" area of any image, and add text.  There will also be two icons at the top right of the page -- "metadata" and "arrange" buttons.

----
<p><br /></p> 

<h3 id="directory-structure">DIRECTORY STRUCTURE</h3>

Photo gallery libraries tend to get ambitious -- they want to be the place that a user organizes all of their photos.  For instance [Photoiew](https://photoview.github.io/) looks pretty cool for that purpose.  

The "Kaboom" library has a much smaller scope - to organize specific photos for web presentation, based on directories.  It does this with two directories, "gallery-static" and "gallery-active".  These directories are not included in the git repo, but you can generate and populate them with this command, run from the root of your "kaboom" project directory.

```cli
$~/kaboom> kaboom init
```

See the [CLI section](#cli-help) for more.

**The `gallery-static` Directory**  
The gallery expects to be flat -- a list of album directories at the top level, such that every album is a peer.  like this...

```
gallery-static
 -- first-album-url
 -- second-album-url
 -- third-album-url
```

---

**Album Structure**  
Each album has what I like to think is a reasonable, human-comprehensible structure.  The gallery expects a new album to look like this:

```
first-album-url
 -- __original
     -- image-1.jpg
     -- image-2.png
     -- image-3.jpeg
     -- image-4.gif
```

To include photos in a given album: you put the image files in the `__original` sub-directory.  

After the library processes all the images, your directory will look like this:

```
first-album-url
 -- __app
 -- __original
 -- large
 -- medium
 -- small
 -- svg
 -- tiny
 -- album-1-to-10.json
 -- album-11-plus.json
 -- index.html
```

The generated image files are fairly explicit and understandable.

```
first-album-url
 -- __app
 -- __original
     -- image-1.jpg
     -- image-2.png
     -- image-3.jpeg
     -- image-4.gif
 -- large
     -- image-1--large.jpg
     -- image-2--large.jpg
     -- image-3--large.jpg
     -- image-4--large.jpg
 ...
```

----

**JSON data**  
The order of the images on the page, and the descriptions for each image, are handled in the app, and stored in two JSON files:  `album-1-to-10.json` and 
`album-11-plus.json`

The json files -- with the notable exception of the "svgSequences" object -- are full of normal human-readable info.

```json
{
    "url":"demo-album",
    "section": "1-to-10",
    "imageCount": 4,
    "images":[
        {
            "fileName": "kaboom_1_demo.png",
            "width": 2400,
            "height": 1600,
            "title": "kaboom_1_demo.png",
            "description": "<h1>html description!</h1<p>What can I say?</p>",
            "svgHeight": "170",
            "svgWidth": "256"
        },
        {
            "fileName": "kaboom_2_demo.jpg",
            "width": 2400,
            "height": 1600,
            "title": "kaboom_2_demo.jpg",
            "description": "",
            "svgHeight": "170",
            "svgWidth": "256"
        },
        {
            "fileName": "kaboom_3_demo.jpeg",
            "width": 2400,
            "height": 1600,
            "title": "kaboom_3_demo.jpeg",
            "description": "",
            "svgHeight": "170",
            "svgWidth": "256"
        },
        {
            "fileName": "kaboom_4_demo.gif",
            "width": 2400,
            "height": 1600,
            "title": "kaboom_4_demo.gif",
            "description": "",
            "svgHeight": "170",
            "svgWidth": "256"
        }
    ],
    "svgSequences": {"filename": "array-of-arrays"}
}
```

---
<p><br /></p> 

<h3 id="cli-help">KABOOM CLI</h3>

Once you have run `npm install` and then `npm link`, the "kaboom" command should be available to the command line.  Running "kaboom" by itself will return a short help menu.

```
$> kaboom

------- KABOOM -----------                                                
                                                                          
 kaboom                   short help file                                 
 kaboom help              full help file                                  
                                                                          
 kaboom init              add /gallery-static, /gallery-active/demo-album 
 kaboom serve             run the web server on //localhost:2713                    
                                                                          
 kaboom ingest            process images, all albums in /gallery-active   
 kaboom ingest [name]     process images in /gallery-active/[name]        
                                                                          
 kaboom to-static         move all /gallery-active to /gallery-static     
 kaboom to-static [name]  move /gallery-active/[name] to /gallery-static  
                                                                          
 kaboom to-active         move all /gallery-static to /gallery-active     
 kaboom to-active [name]  move /gallery-static/[name] to /gallery-active  
                                                                          
--------------------------                                                
                                                                          
```





