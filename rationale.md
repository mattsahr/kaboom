<h4>Is there a point?</h4>

The "Kaboom" project exists because [Flickr.com](https://flickr.com) finally started charging money.  

Until Feb 2019, they were providing one free TB of image hosting, with album organization and metadata and description captions to boot.  And then they decided they wanted money?  The nerve!  

I had a whole bunch of photo albums on Flickr.  While I find the Flickr UI to be more or less awful it was still... serviceable?  And you can use their API, it's quite solid, to display albums on your own website.  That's what I did, in a design not too different from the current Kaboom project.  

Fifteen years of free hosting is a long time.  I had started to think that Flickr was just... there.  A public utility.  

When the free lunch finally dried up, I thought -- I ought to be more in control of my digital stuff.  So I set out to reinvent the wheel, assuming that The Latest Web Dev Hotness was going to blow the doors off the old creaky Flickr version.

Spoiler: it took a lot of work.  To replace Flickr, I looked for a good static site generator.  I tried my fair share.  [Gatsby](https://www.gatsbyjs.com/), [Pelican](https://blog.getpelican.com/), [Hexo](https://hexo.io/), [Eleventy](https://www.11ty.dev/), [Hugo](https://gohugo.io/), [Sapper + Netlify](https://www.netlify.com/blog/2016/09/29/a-step-by-step-guide-deploying-on-netlify/), and [NextJS](https://hexo.io/).  And while I didn't go full-immersion for all of them, I did recreate my photo album in Gatsby, Pelican and Hugo. 

All of those projects are cool.  None of them did quite what I wanted.  I could have used any of them, with relative ease, if my goal was to have a regular blog.  All the SSG's are pretty good default-wordpress-killers.  But my special case (it's not THAT special, a photo album with robust file-size accommodations) meant all of the platform builds became just a little too customized, for my taste.

<h4>Towards a "correct" Static Site Generator</h4>

This is my version of a "correct" static site generator (SSG).  I didn't know I had a version of "correct" SSG until I built it.  Correct to me means static === permanent.  

<h4>DEFINITION: Static-for-performance</h4>

A site that is static-for-performance is just one that doesn't use a database in production, or doesn't use it dynamically (though it may churn and churn to build static assets in the background).  But in many SSG projects, the pages themselves are not static -- they change a lot, every time you rebuild the site.  

I am overly literal, and I approached static site generators from the point of view that the stuff the generated ought to be **REALLY** static.  That is, I expected permanence.  Once I am done editing a page, it ought never change, which should help immensely with site rebuilds, and site deploys.  I think on the whole the SSG community is pursuing the other kind of static, which is to benefit from very performant web delivery, but not actually care that pages persist.

<h4>DEFINITION: static-for-permanence</h4>

Now, for me, it seems Self Evidently True -- that a static site should be a collection of static pages.  Duh.  

Yup, but I end up wanting to define a "static page" to be: the atomically robust[[**1**](#atomically-robust)] document-directory[[**2**](#document-directory)] comprising a complete whole[[**3**](#single-whole)] of context-agnostic[[**4**](#context-agnostic)] content.  In nuts and bolts terms, a given page/directory should work properly based on files within its directory, and nothing else.  

```
/page-example-one/
    -- index.html
    -- stuff
         -- image-1.jpg
         -- image-2.jpg
    -- js
         app.js 
```

<h4 id="atomically-robust"><span style="font-size: 1.4em">1. </span> Atomically Robust</h4>

For the `page-example-one` directory to be a proper static page, you must be able to copy the directory and paste it, (ftp it, git commit it, send it) to a new arbitrary place.  And the page (directory), accessed from the new web server location, should still work.  If it still works, it's **robust**.

Another way to put this: if the internet is disconnected, and you only have this one directory, does it still serve up a useful atomic thing?

The words "useful" and "robust" are not binary, and the meaning of "it still works" depends on who's asking.  For many websites, a directory plucked out and dropped into a new server is not going to have all of its bits and pieces intact.  An advertiser would probably not think a document was "robust" unless it reliably served up advertisements.  If the advertiser was in charge, they might include an advertisement locally, inside the directory, just to be sure they could spam the All The Eyeballzz.  

Navigation is a big question.  If the navigation doesn't function on a page (point you to the rest of the site, collection, library) -- does the document "still work?" in a meaningful way?  Many Static Site Generators rebuild the nav inside each document, every time a page changes on a site.  It is one of the big slowdown concerns, when a site gets large.

For my purpose, the "atomic" part of atomically robust means that no, navigation is not part of the "robust" guarantee.  Which also means that if the navigation fails to load -- it shouldn't look wrong/broken.  It should just look like a page with no nav buttons.

<h4 id="directory-document"><span style="font-size: 1.4em">2. </span> Directory as Document</h4>

A Static Page is a Document.  I find myself again stating something that is almost tautologically obvious.  But what I mean is that a static page, besides being atomically robust, should fulfill the normal contracts and promises that a "document" suggests in the real world.  

Documents in a library, and documents in a courthouse, and documents in a Robustly Static Site, ought to fulfill the same basic set of guarantees.  Earthquakes and fires notwithstanding, they ought to be permanent.  Permanent things can be edited.  And you can throw away the old version.  But that action should be conscious, deliberate, never a side effect of site maintenance.

This means a static site generator should be built that avoids changing a directory unless something in the document was deliberately edited.  Many static site generators run contrary to this.  Pages across a "static" site get updated ALL THE TIME, as a result of the build process, when nothing about the page was updated or edited by human intent.  

A good static site generator should not do that.

<h4 id="single-whole"><span style="font-size: 1.4em">3. </span> Complete Whole</h4>

The promise of a document, in the human-centric pre-internetz sense, is that it is a whole complete thing.  Arguably, documents don't succeed, but there is a contract between people, that the documents we make ***attempt*** to be whole and complete.  A document ought to have a beginning, middle and end.  It ought have a purpose, which can be consumed by itself by a human, at the end of which its purpose (or vague aim or hope, hankering) might reasonably be achieved.

Like if you get to the end of War And Peace --  maybe it landed on your soul, maybe not, but the structural bit succeeded -- the whole document was the sum total, all of Tolstoy's attempt.  You close the book and look up, smug from you Almond Chai-Latte and wink at the other cafe denizens.  "Yo Dawg.  I just Finished War and Peace.  Document.  Complete!"  They clap for you.  A document has landed.  

Similarly, when you get back home and someone has spray-painted, **"CHEEZ-POSER YOU SUKKzZ"** on the wall of your bedroom -- again, message delivered.  Document complete.

A blog post is a document.  A blog post + comments is a document.  A set of comments about a blog post, without the underlying blog post, is NOT a document.  Nor, obviously, is a single comment.

This suggests that a "correct" static site would collect and store all the comments for a given blog post, and keep them inside the blog post directory.  Which also suggests that all the code for enabling comments should live wholly inside the directory.  And given the obligation for moderating spammers and trolls -- that's not super realistic.

I guess that the middle ground would be a directory-internal way to show comments, and a graceful degradation, such that when/if the leave-a-comment system is unavailable, the blog post and current comments nonetheless appear as a whole, and don't look broken.

<h4 id="not-a-stream"><span style="font-size: 1.4em">3.5 </span> Not a Stream</h4>

The idea of a continuous stream of communication -- Facebook or Twitter -- is kindof antagonistic to the idea of documents.  Which suggests one ought to know ahead of time the kind of thing one is trying to build -- is it a library, or a lunch room?  Or a trading pit?

If you want a lunch room or a trading pit, you probably don't want a Static Site Generator.

The thing that is shared between all of them (library, lunch room, trading pit) is navigation.

<h4 id="context-agnostic"><span style="font-size: 1.4em">4. </span> Context Agnostic</h4>

If I think an ideal page should behave like a document, it allows me to rule out important stuff.  A document can be simpler, because it ought have no awareness of the rest of the site -- no parent page references, no sibling pages, none of it.  Nav (or interconnection more dynamically conceived) is a concern of the controlling website, not a concern of the page.

Navigation is not trivial.  It is a thing that is never "solved" for any useful definition of the term.  But the least we can do, documents (pages, directories) ought to work by themselves, even when navigation fails.  If you stick documents on some random web server in the wilderness, you still got documents.  

I am thinking that "navigation" becomes a kind of stand-in term for all the wider concerns a website might bring to bear.  It becomes a symbol of "the stuff the page does not care about."

```html
<html>
    <head>
        <script src="../nav.js"></script>
        <script src="../site-wide-stuff.js"></script>
    </head>
</html>
```

Including the "../" at the front of "`../nav.js`" points browsers to the page parent, not the page/directory itself.  I don't love the idea that an "orphan" page/directory has a standard mode of operation where it tries and fails to load "../nav.js" (and or any other "../site-wide-stuff.js").  This is noise and network traffic and browser console errors.  Not remotely elegant.  But once we're dealing with failure modes -- the best we can hope for is a useful, gracefully degraded failure mode?

If all static site generators made atomically robust pages, then you could mix and match whatever pages you want from a bunch of different SSGs, collect the pages on web server, and the only problem left to solve, then, is navigation, broadly defined.

<p><br /></p>

<h4>Document as a Declaration</h4>

In the real world, not all directories are documents.  

The kaboom project uses a whole bunch of image folders like "small", "medium", "large" etc, and I don't expect that each individual one of them claims to represent, to any wider system, "I am a complete atomic thing -- a document."  And sooth, I have no current solution for this.  The naive fix would seem to be a dotfile, it could be empty, but its existence is a claim of document-hood.  Something like this...


```
album-name
  --- /++original/
  --- /++app/
  --- .yo-dawg-im-a-document
  --- album-1-to-10.json
  ...etc
```

So we'd be making a rule -- that any organizing system using this new protocol looks for the `.yo-dawg-im-a-document` file, and having found one, treats that directory as a document.  Ugh.  Seems arbitrary and flaky and error-prone, and I have just invented [One More Standard](https://xkcd.com/927/).  So.  Not solved.

Assuming there is a **GOOD** way to represent in a file structure "I'm a document", we can stop, within the confines of the document, worrying about the wider world (how to organize it, where to link, etc).

<p><br /></p>

<h4>Playing Well with Others</h4>

Permanent things can be organized.  But the document itself can't promise any organization.  If the local librarian sucks at being a librarian, you might not be able to find any books in their library.  That is not the fault of any given paperback on the shelves.  But the expectation of unchanging permanence means organization can be built around the document.

I think the history of the internets proves that WWW stuff is *waaaaaay* less permanent than people were expecting it to be.  Obviously, a document can't be responsible for "permanenting" itself.  You can't expect the paperbacks to be fireproof.  You can't expect the web page to protect itself from earthquakes at the data-center.  Uhm.  I have stepped off the cliff into disaster prep and library science, fields I know nothing about.  

Here is one practical result of the "just a document" model.  I originally had JSON objects that defined the album, where it declared "this is my url."  Nothing fancy, just...

```
{
   "title": "My Awsum Photoz!",
   "url": "my-awsum-photoz",
   "images": [ ... ]
   ...
}
```

The "url" was a piece of internal data.  But I think (I think) that documents aren't properly concerned with "where am I?"  So I refactored to get rid of the "url" field.   Now, the script that builds the nav meta just reads the directory name, "my-awsum-photoz", and remembers that fact for the purpose of building links.

The second-order ramifications of this location agnosticism are immediately too complicated to solve.  What I mean -- say I make a photo album about Tokyo, and then I want to mention that this or that photo is similar to one from Okinawa.  So I would like to include a link to my Okinawa album.  Obviously, I can just make the link. 

```html
<a href="../okinawa">Check out Okinawa!</a>
```

And if I trust that the Kaboom site is set up properly, that link will go to the right place.

But if we expect documents to drift and get lost/rearranged over time, it seems unwise to write my link that way.  And yet, the whole damn internet works on urls -- what ought to be permanent, but isn't.  

There are lots of smart people [reserching](https://www.dougengelbart.org/content/view/138) and [re-researching](https://www.researchgate.net/publication/334126329_Weaving_a_Decentralized_Semantic_Web_of_Personal_Knowledge) the question of Knowledge Organization, with working systems on the market -- [[Athens](https://opencollective.com/athens)], [[Roam](https://roamresearch.com/)], [[Memex](https://www.steveliu.co/memex)].  Turns out this little photo-album project is not going to solve the problem...?  Who knew.  The problem of impermanence.  Not Solved.  

<p><br /></p>

<h4>Design for Forgetting</h4>

My habit is to post one or two photo albums per year.  In between times, I forget how the website works.  I do a lot of forgetting, I suppose, especially forgetting side-project details.  So when I return, I don't want mental overhead.  I don't want to have to remember finicky, complicated stuff associated with a nuanced build.  If I need to remember where the custom config is hidden, or where the files end up, or how the js-splitting works, and what needs copy-pasted if I start editing pages, we are already heading the wrong direction.  Added to this is the exciting prospect of consulting documentation for the Current Awesome Version of the SSG, where mine was built on the Old Deprecated Lame-O setup from six months ago.

So yeah, I am ungrateful.  All of those open source projects offered to me for free.  None of them was Just Right, and god forbid I keep proper notes of what I was working on.

I would like to think that Kaboom is simple and easy to learn, and/or easy to remember after some hiatus.  But I bet everybody who makes these SSG libraries thinks theirs is easy.  For me, I am happy that all I have to remember is to type this at the command line:

```
kaboom
```

The help file hopefully will lead me by the nose through the rest of the steps.