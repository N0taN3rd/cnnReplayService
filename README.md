# CNN Homepage Replay Service
Replay mementos of the [CNN](http://cnn.com) homepage from the [Internet Archives](https://archive.org/) locally without failure.

## Why Is This Necessary
For a detailed explaination as to why this is necessary see the blog post from the
Web Science And Digital Libraries Research Group:
[2017-01-20: CNN.com has been unarchivable since November 1st, 2016](http://ws-dl.blogspot.com/2017/01/2017-01-20-cnncom-has-been-unarchivable.html)

#### TL;DR
CNN has made changes to how the contents of their homepage is loaded. One of the
methods used to accommodate these changes is to set the `document.domain` property
of the global `window` object to `cnn.com`.

This is not allowed when replayed via
the Internet Archives [Wayback Machine](https://archive.org/web/) due to the
[Same Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
of web browsers. Subsequently causing information about how to load the contents of
the page to not be made available to the JavaScript responsible for the
loading and rendering of it.

Due to this, replaying mementos of the homepage after [2016-11-01T13:15:40](http://web.archive.org/web/20161101131540/http://www.cnn.com/) appear
to be an archived `about:blank` page.
<p align="center">
  <img height="250" src="cnnWhiteOut.png"/>
</p>


But we can replay these mementos. We have the technology.
We can replay these mementos as archived. With a few modifications :godmode:

## Modifications Made To The Replayed Memento
This project intelligently removes the offending line of JavaScript code
```js
window.document.domain = "cnn.com";
```
from the second inline `script` tag in the `head` of the mementos HTML
if it is present at replay time.

The project also dynamically rewrites specific URI-Rs that the Internet Archives own
rewrite mechanisms missed to a URI-M corressponding to the datetime of the Memento
currently beging replayed.

For example if you were to view a Memento of http://www.cnn.com on 2017-03-10T06:03:34
via this project the archived pages JavaScript would request

`/data/ocs/section/_homepage-zone-injection/index.html:homepage-injection-zone-2/views/zones/common/zone-manager.izl`

Which this project would rewrite to `/web/20170310060334/http://www.cnn.com/data/ocs/section/_homepage-zone-injection/index.html:homepage-injection-zone-2/views/zones/common/zone-manager.izl`

Without these rewrites the page content on 2017-03-10T06:03:34 would not be viewable as
these URI-Rs are included in the information made available to the archived pages JavaScript
by the previous modification made by this project.

If the Internet Archives own rewrite mechanisms missed these URI-Rs then the Internet Archive
must not have these resources?

As of 2017-03-20 the Internet Archive contains 201 mementos of the URI-R. This number was obtained by executing the following command seen below /play drama
```shell
curl http://memgator.cs.odu.edu/timemap/link/http://www.cnn.com/data/ocs/section/_homepage-zone-injection/index.html:homepage-injection-zone-2/views/zones/common/zone-manager.izl | grep memento -c
```
