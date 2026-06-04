#!/bin/bash
git filter-branch -f --env-filter '
case "$GIT_COMMIT" in
  861136a0c63380eba7fd832ad5abe3a445e6db95|\
  ad4fdc23f58a8b96d8206927c5b148522ef1f785|\
  d9bcc7040cf518811f1c104d6e20718fcecfd8d8|\
  a3eaba67e1ef5c4ac219c0ef2fa9f9b67cba45f7|\
  5c3813d1a9b4a10d286a67ed57634a979c453162|\
  be918fb21940407de4608c262bf5fb1dff00098d)
    export GIT_AUTHOR_NAME="Bayu Imantoro"
    export GIT_AUTHOR_EMAIL="bayuimantoro5@gmail.com"
    export GIT_COMMITTER_NAME="Bayu Imantoro"
    export GIT_COMMITTER_EMAIL="bayuimantoro5@gmail.com"
    ;;
  2e4a6d7a2a58dc94d575be2641d0779afbc8051e|\
  c89fba756067d07c4949139c2f7bc162b9abec23|\
  ae77e21479e9c7ec65da3aa79420b2339e69eee6|\
  d50979595706485e13731cdadd17fe3cfa8e0fd1)
    export GIT_AUTHOR_NAME="Muhammad Abshar Hakim"
    export GIT_AUTHOR_EMAIL="m.absharhakim@gmail.com"
    export GIT_COMMITTER_NAME="Muhammad Abshar Hakim"
    export GIT_COMMITTER_EMAIL="m.absharhakim@gmail.com"
    ;;
  4ce47e34293d9a90aba4135733502aa5cac7984b|\
  b4a26883429b635756abd15d760d95339bec45e9|\
  6e3606127d31c951ec91a56c2bf440249b66d5bc|\
  6f278a0dfff4f49e59d0a594efe481382d1fdca1|\
  471109335c69d57136c08de47048c9f475cc92d4|\
  af3d9baef592cf85c33884ef9792aa736fef2baa|\
  06d3ef62a2a801443294b55ebc0368979691e2c4|\
  a87c616db75cdd1b745d3703fc8de226e64c1a67|\
  d647c3c3b7790b44baaeb7e4b0448614a0581e66)
    export GIT_AUTHOR_NAME="Rian Putra Pratama"
    export GIT_AUTHOR_EMAIL="rianputrapratama666@gmail.com"
    export GIT_COMMITTER_NAME="Rian Putra Pratama"
    export GIT_COMMITTER_EMAIL="rianputrapratama666@gmail.com"
    ;;
esac
' --tag-name-filter cat -- --all
