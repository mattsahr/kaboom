# Kaboom.
A small, fast, static site photo gallery.  Written in node.js and Svelte.  
[Demo Gallery](https://mattsahr.github.io/kaboom-demo/kaboom-how-to/)

**TLDR INSTALL**  
Install [Node](https://nodejs.org/)  
or make sure your node version is 12 or greater `node --version`

```
git clone https://github.com/mattsahr/kaboom.git
cd kaboom
npm install
npm link
kaboom init
kaboom serve
```

[Full Installation Guide](#installation)  

----

<h3 id="design-goals">DESIGN GOALS</h3>

**Startup Bundle Size**  
Kaboom focuses on quick load & fast startup.  Total bundle size is under 50kB (gzipped) -- with inline images included.  That last bit -- inline images included -- is the kicker: delivering the first 10 browseable images, with a "zoom in" lightbox and description/captions, in under 50kb.

| Above the fold       |     raw     |       gzip   |      brotli   |
|----------------------|------------:|-------------:|--------------:|
|  index.html          |     3.8 kB  |      2.1 kB  |       1.3 kB  |
|  album-basic.js      |    55.3 kB  |     19.8 kB  |      16.6 kB  |
|  bundle-basic.css    |     4.9 kB  |      1.7 kB  |       1.1 kB  |
|  album-1-to-10.json  |    30.9 kB  |     14.0 kB  |      11.2 kB  |
|  **TOTAL**           | **94.9 kB** |  **37.6 kB** |  **30.2 kB**  |

There are more files that load "below the fold", including the nav menu (JS and CSS), and images past the first 10 in an album.  These below-the-fold files arrive in a second phase and shouldn't affect startup speed.  

| Below the fold       |     raw      |       gzip   |      brotli   |
|----------------------|-------------:|-------------:|--------------:|
|  nav-app.js          |    32.6 kB   |     11.4 kB  |       9.5 kB  |
|  bundle-nav.css      |     4.7 kB   |      2.0 kB  |       1.3 kB  |
|  album-11-plus.json  |   223.2 kB   |     83.1 kB  |      75.9 kB  |
|  **TOTAL**           | **260.5 kB** |  **96.5 kB** |  **85.7 kB**  |

To some extent, your mileage will vary concerning the size of the `album-1-to-10.json` file.  It depends on how much description text you include.  If you write a novel to accompany each image, the JSON is going to get bigger.

Similarly, size will vary quite a bit in the `album-11-plus.json` file.  It contains all the images past the first 10.  The estimate here is using a gallery with 84 total images, including two or three sentences of description with each.

Finally, these number are only concerned with the inline place-holder images that get the page on its feet.  Once the browser starts pulling down the "real" images, bandwidth shoots up.  

**Lazy Loading**  
Real images only load once they enter the viewport.  The "small" images (image panel up to 700px width) average about 75kB, while the "medium" images (loading on larger screens) average between 120 and 180kB.

The "large" version of any given image only loads when a user opens the lightbox.  And the original image generally doesn't load unless a user chooses to download.

---

**Good Place Holders**  
The gallery aims to make good-looking inline placeholder images by using methods from Michael Fogleman's amazing [Primitive](https://github.com/fogleman/primitive) library (extended in [C++](https://github.com/Tw1ddle/geometrize) or [Haxe](https://github.com/Tw1ddle/geometrize-haxe), or of course [Javascript](https://github.com/cancerberoSgx/geometrizejs)).  The placeholder images are rendered as simplified geometric mosaics, like this one. 

<div style="width: 100%; display:flex; justify-content: center">

![Demo Primitive](./src/dummy/demo.svg)

</div>

Place-holders are svg, made of 100 overlapping ovals.  Data for each place-holder amounts to about 3k of uncompressed json.  The [GeometrizeJS](https://github.com/cancerberoSgx/geometrizejs/tree/master/geometrizejs) library has many other options besides ovals, but I found that ovals look pretty good on a broad array of images, and they are very terse, compressible in JSON format.

---

**Layout Style: Image + Description**  
The layout gives text a fair amount of prominence.  It makes room for descriptions, listing the text side-by side when the screen is wide enough.  

<div style="width: 100%; display:flex; justify-content: center;">

![Demo Gallery Snapshot](./src/dummy/demo-gallery-snapshot.jpg)

<div style="padding: 1em 0 0 2em;">

If you don't care about descriptions, this gallery might not be a good fit...?  

Or at least, you'd have to restyle a bit.  In this case, styling involves editing the Svelte files.  Since the total CSS bundle is under 5k, restyling should be pretty manageable.

</div>
</div>


---

**Human Readable Directories**  
The gallery keeps directories as simple and flat as possible, with file naming rules aimed at being understandable by humans.  The directories are built for straightforward deployment by FTP or equivalent.  See the [directory structure section](#directory-structure) for details.

----

**More Design Thoughts**  
I had a lot more stuff about designing static site generators.  But it's fairly [tangential](https://github.com/mattsahr/kaboom/blob/master/rationale.md).

----

<p><br /></p> 

<h3 id="installation">INSTALLATION</h3>

Install [Node](https://nodejs.org/)   
Or Make sure your node version is 12 or greater 

```
node --version
```
If you need to update your node version: [some options](https://stackoverflow.com/questions/10075990/upgrading-node-js-to-latest-version#10076029).

**Installing kaboom**  
```
git clone https://github.com/mattsahr/kaboom.git
cd kaboom
npm install
npm link
```
**NOTE** on mac/linux you likely need `sudo npm link` for the last step. 

Once you have kaboom installed and linked, you should be able to type this at the command line

```
$> kaboom
```

If kaboom installed correctly, you will see a short help file. ([more CLI details](#cli-help))  

Type this command to add a demo album:

```
kaboom init
```

Running "kaboom init" will make a /gallery/ directory, just below the /kaboom/ directory.  it will then populate that /gallery/ with a directory called "demo-album"

```
/kaboom/
    /gallery/
       /demo-album/
            /++original/
             -- kaboom_1_demo.png
             -- kaboom_2_demo.jpg
             -- kaboom_3_demo.jpeg
             -- kaboom_4_demo.gif
        -- favicon.png
```

The "init" command will then process these images and make various sized versions.   **NOTE** -- you must have **nconvert** and **primitive** installed for the "init" command to complete successfully.   

**Wait for it**  
The step where the svg images get made takes a while.  On my 2016 era laptop, it takes about 30 seconds per image.

After a minute or two, the "init" process should complete.  Then you should be able to run the server, and see your album.

```
kaboom serve
```

In a web browser, browse to [http://localhost:4444](http://localhost:4444)

At this point, on the web page, you should be able to click in the "Description" area of any image, and add text.  There will also be two icons at the top right of the page -- "metadata" and "arrange" buttons.

---
<p><br /></p> 

<h3 id="editing">Editing</h3>

Hopefully editing in the app is fairly easy to pick up from the UX.  There are some instructions on editing here:

[https://mattsahr.github.io/kaboom-demo/](https://mattsahr.github.io/kaboom-demo/)

----
<p><br /></p> 

<h3 id="directory-structure">DIRECTORY STRUCTURE</h3>

The "Kaboom" library has a small scope - to organize albums for web presentation, based on directories.  All albums are built inside a "gallery" directory.  The "gallery" directory is not included in the git repo, but you can generate it and populate a demo album with this command, run from the root of your "kaboom" project directory.

```cli
$~/kaboom> kaboom init
```

See the [CLI section](#cli-help) for more.

**The `gallery` Directory**  
The gallery expects to be flat -- a list of album directories at the top level, such that every album is a peer.  like this...

```
/gallery/
    /first-album-url/
    /second-album-url/
    /third-album-url/
```

---

**Album Structure**  
Each album has what I like to think is a reasonable, human-comprehensible structure.  The gallery expects a new album to look like this:

```
/first-album-url/
    /++original/
     -- image-1.jpg
     -- image-2.png
     -- image-3.jpeg
     -- image-4.gif
```

To include photos in a given album: you put the image files in the `++original` sub-directory.  You can also use the `kaboom add` command (see the [cli section](#cli-help)).

After the library processes all the images, your directory will look like this:

```
/first-album-url/
    /++app/
    /++original/
    /large/
    /medium/
    /small/
    /svg/
    /tiny/
 -- album-1-to-10.json
 -- album-11-plus.json
 -- index.html
```

The generated image files are fairly explicit and understandable.

```
/first-album-url/
    /++app/
    /++original/
     -- image-1.jpg
     -- image-2.png
     -- image-3.jpeg
     -- image-4.gif
    /large/
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
__________________________

  kaboom                   Short help file
  kaboom help              Full help file

  kaboom init              Make a /gallery/ directory and put a /demo-album/ inside

  kaboom serve             Run a web server on localhost:4444
  kaboom serve static      Run a web server on localhost:4444, static version

  kaboom add               From the curent directory, add all images to a new album

  kaboom ingest            Choose an album, resize & make placeholders for all images

  kaboom compare           Declare a remote deploy directory, check what needs updated

  kaboom static            Set albums to static, ready for FTP or other delivery
__________________________
```

---
<p><br /></p> 

<h3 id="site-config">Site Config File</h3>

Once you run `kaboom init`, there will be a config file located in the /src/ directory.

```
/kaboom/src/site-config.json
```

Some day I hope to make some nice UX inside the app, for editing the site config.  But for now, you will need to edit the JSON yourself, when you want to adjust home page nav, or any desired "extra" links.  The JSON looks like this:

```json
{
    "custom_nav": {
        "homeButton": "standard",
        "homeCustom": {
            "title": "Back to Main Site",
            "subtitle_A": "Not in use, homeButton set to 'standard'",
            "url": "../"
        },
        "homeRedirect": "demo-album",
        "bottomLinks": {
            "category": "Related Sites",
            "links": [
                {
                    "title": "Kaboom Project",
                    "subtitle_A": "Github",
                    "url": "https://github.com/mattsahr/kaboom"
                },
                {
                    "title": "Another Rando Link",
                    "subtitle_A": "edit /src/site-config.json",
                    "url": "https://example.com"
                }
            ]
        }
    }
}
```

<p><br /></p>

**HOME PAGE**  
The kaboom project builds a "home" page by taking one image from each child album.  The "home" index.html page sits in the root /gallery/ directory.  And the "home" button in the nav points to the index.html page in the root `/gallery/` directory.  That's the setup out of the box, but you can adjust it.  

**CUSTOM HOME**  
If you want to use your own custom home page -- **DON'T** store it in the /gallery/ directory.  Store it somewhere else, and feed a copy into /gallery/index.html when you deploy.  The build process updates the built-in /gallery/index.html page, so it will overwrite whatever resides there.

**NO HOME PAGE**  
You may not want a "home" page.  The nav can simply link sibling albums to each other, without using a "home" at the root.  To avoid any home page at all, edit the /src/site-config.json file:

1.  Set `"homeButton": "none"`

```json
{
    "custom_nav": {
        "homeButton": "none",
        ...
    }
}
```

<p><br /></p>

**CUSTOM BUTTON**  
Instead of using /gallery/ as a "home", you can override the nav so that the "home" button says what you want, and links where you want. To use the override, edit the /src/site-config.json file:

1.  Set `"homeButton": "custom"`
2.  Edit the `"homeCustom"` object to use your details.

```json
{
    "custom_nav": {
        "homeButton": "custom",
        "homeCustom": {
        "title": "Your text",
            "subtitle_A": "Your Subtitle",
            "url": "https://your.link.com"
        },
        ...
    }
}
```

<p><br /></p>

**OTHER NAV LINKS**  
The `/kaboom/src/site-config.json` has a section called `"bottomLinks"` where you can append extra items that will appear in the nav after all the gallery pages.  If you don't want extra links, delete the `"bottomLinks"` object, or set the `bottomLinks.links` to be an empty array.

```json
// AN EMPTY "links" ARRAY MEANS NOTHING 
// WILL BE DISPLAYED BELOW THE ALBUMS LIST
{
    "custom_nav": {
        ...
        "bottomLinks": {
            "category": "",
            "links": []
        }
    }
}
```
<p><br /></p>

----

<p><br /></p>

<h4>Development</h4>

The CLI parts of the project are in `/kaboom/src/`  
The app parts of the project are in `/kaboom/app/`

To develop or customize the app, install the svelte setup.

```
cd kaboom/app
npm install
npm run dev
```

This should start a server at `localhost:5000` that hot loads the svelte code.

The `npm run dev` is good for developing.  When you're happy with your changes,  
run `npm run build` to bundle the app for wider use.

Most of the code is in `/kaboom/app/templates/`  
Some of the framework stuff is in `/kaboom/app/base/`

The svelte process builds into the `/kaboom/app/pages/` directory.  
The `/localhost:5000` dev server finds its stuff in  `/kaboom/app/pages/`

There are actually 3 apps built by the svelte build process.

```
SOURCE  /kaboom/app/templates/Album.svelte
BUILDS  /kaboom/app/pages/++app/album-app.js

SOURCE  /kaboom/app/templates/AlbumBasic.svelte
BUILDS  /kaboom/app/pages/++app/album-basic.js

SOURCE  /kaboom/app/templates/Nav.svelte
BUILDS  /kaboom/app/pages/nav-app.js
```

The basic version -- `album-basic.js` -- is generally what you want to deploy.  
The full version --  `album-app.js` -- is for locally editing pages.

There is nothing that dictates the "basic" app should look anything like the full app.  At the moment they look almost identical, but that's just me.  If you want to change the look and feel of the public-facing galleries -- mess around with the "basic" app.

**The CLI and the app flavors**  
The kaboom CLI picks up already-built files from `/kaboom/app/pages/`  
It copies them into the various directories in `/kaboom/gallery/`  

When you run either of these commands...

```
kaboom static
kaboom serve static
```

it propagates `album-basic.js` to the galleries.  

<p><br /></p>

When you run this command...
  
```
kaboom serve
``` 

it propagates `album-app.js` to the galleries instead.


<p><br /></p>

----

<p><br /></p>

<h4>To Do</h4>

-- It is annoying, time-consuming, that when you want to just add a photo to an existing album, `kaboom add` re-runs the entire ingest process.

-- The `site-config.json` file is fine, but it would be better if all that stuff was editable from inside the app.

-- The deployed nav app would be smaller if we had a "nav-basic.js" build without the editor.

