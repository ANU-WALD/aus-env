#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import os
import shlex

# -- General configuration ------------------------------------------------

# If your documentation needs a minimal Sphinx version, state it here.
needs_sphinx = '1.0'

# Add any Sphinx extension module names here, as strings.
extensions = []

# The suffix(es) of source filenames, string or list of strings
source_suffix = '.rst'

# The master toctree document.
master_doc = 'index'

# General information about the project.
project = 'Aus-Env'
copyright = '2016, Albert Van Djik (CC-BY-SA)'
author = 'wenfo.org'

# The version info for the project you're documenting, acts as replacement for
# |version| and |release|, also used in various other places throughout the
# built documents.
version = release = '0.1'

# |today| is replaced with a strftime call in the following format.
# If not '', a 'Last updated on:' timestamp is inserted at every page bottom
today_fmt = html_last_updated_fmt = '%Y-%m-%d'

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
exclude_patterns = ['_build', 'node_modules', 'bower_components', 'dist', '.*']

# The reST default role (used for this markup: `text`) for all documents.
default_role = 'ref'

# -- Options for HTML output ----------------------------------------------

# The theme to use.  See the Sphinx documentation for a list of builtin themes.
html_theme = 'alabaster'

# Theme options are theme-specific and customize the look and feel of a theme
# further.  For a list of options available for each theme, see the
# documentation.
html_theme_options = {
    #'logo': 'logo.png',
    'github_user': 'ANU-WALD',
    'github_repo': 'aus-env',
    'github_button': False,
    'travis_button': False,
}

# The name for this set of Sphinx documents.
html_title = 'Documentation for the Aus-Env website project'

# A shorter title for the navigation bar.  Default is the same as html_title.
html_short_title = 'Aus-Env Docs'

# The name of an image file (relative to this directory) to place at the top
# of the sidebar.
#html_logo = None

# The name of an image file (within the static path) to use as favicon of the
# docs.  This file should be a Windows icon file (.ico) being 16x16 or 32x32
# pixels large.
#html_favicon = None

# If false, no module index is generated. If false, no index is generated.
html_domain_indices = html_use_index = False

# If true, "Created using Sphinx" is shown in the HTML footer.
html_show_sphinx = False

# -- Options for LaTeX output ---------------------------------------------
# Generate a new project to see more options, not expected to be used here.
latex_elements = {}
latex_documents = [(master_doc, 'Aus-Env.tex', 'Aus-Env Documentation',
                    'wenfo.org', 'manual')]
