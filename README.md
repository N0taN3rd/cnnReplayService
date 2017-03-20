# CNN Homepage Replay Service
Replay the homepage of [CNN](http://cnn.com) via the [Internet Archives](https://archive.org/)
[Wayback Machine](https://archive.org/web/) locally without replay failing.

## Why Is This Necessary
For a detailed explaination as to why this is necessary see the blog post from the
Web Science And Digital Libraries Research Group:
[2017-01-20: CNN.com has been unarchivable since November 1st, 2016](http://ws-dl.blogspot.com/2017/01/2017-01-20-cnncom-has-been-unarchivable.html)

#### TL;DR
CNN has made changes to how the contents of their homepage is loaded. One of the
methods used to accommodate these changes is to set the `document.domain` property
of the global `window` object to `cnn.com`.

This is not allowed when replayed via
the Internet Archives Wayback Machine due to the
[Same Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
of web browsers. Subsequently causing information about how to load the contents of
the page to not be made available for the JavaScript responsible for the
loading and rendering of it.

Because of this when replaying the homepage after 2016-11-01T13:15:40 appears to be an archived `about:blank` page.
![cnn.com homepage replay white out](cnnWhiteOut.png)


## How Does This Work
