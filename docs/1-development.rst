Development Notes
#################

*This page describes the dependencies of the project, and how
to perform some common tasks.  Add to it as required!*


Build & development
===================

Run ``grunt`` for building and ``grunt serve`` for preview.

After you have cloned git to your local location, you may need to do some of the following:

1. Install Ruby (for sass stuff).
2. Run ``install bower`` from the aus-env root folder.
3. Run ``gem install compass`` (reboot suggested)

The ``.travis.yml`` file contains a complete set of installation commands
for Linux, as the tests and build wouldn't run otherwise.


Testing
=======
Running ``grunt test`` will run the unit tests with karma.

Travis CI is set up to automatically test commits pushed to GitHub,
and can automatically deploy the build if tests pass.
Check locally with ``grunt test & grunt build``


Documentation
=============
Documentation is built with Sphinx, the Python documentation tool.
It takes ``.rst`` files - text files with some Markdown-like formatting
(google 'ReStructured text') - and can convert them to a variety of
formats.  See the makefile, or visit http://aus-env.rtfd.org

We don't want or need detailed documentation of the code (comments +
good structure is enough), but we *do* want to document:

- goals of the project
- the basic design of the website
- the high-level decisions about why we did certain things
- what the data is and where it's from

But this will all remain a work-in-progress, and change as progress is made.
