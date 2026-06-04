#!/bin/bash
# Re-attribute git history to meet specific commit targets:
# Albar: 9 commits
# Bayu: 14 commits
# Rian: 16 commits
# KimAkimMan: 5 commits
# Rizal: Remaining commits

export FILTER_BRANCH_SQUELCH_WARNING=1

git filter-branch -f --env-filter '
MSG=$(git log -1 --pretty=format:%s "$GIT_COMMIT")

case "$MSG" in
  "fix glitch" | \
  "feat: implement core frontend dashboard, authentication, and prediction data management structure" | \
  "feat: dynamically resolve backend API URL based on devtunnel hostname" | \
  "feat: initialize web application structure with dashboard, input form, and prediction tracking functionality" | \
  "feat: implement user authentication system and associate prediction results with authenticated users" | \
  "feat: implement flexible prediction types and support history-based input restoration" | \
  "Update frontend dan backend" | \
  "feat: implement full-stack project architecture with React frontend and Bun-based backend service" | \
  "chore: update root .gitignore for main branch to track both ML and WD")
    export GIT_AUTHOR_NAME="Albar19"
    export GIT_AUTHOR_EMAIL="muhamadhafizhalbar@gmail.com"
    export GIT_COMMITTER_NAME="Albar19"
    export GIT_COMMITTER_EMAIL="muhamadhafizhalbar@gmail.com"
    ;;
  "first commit" | \
  "hapus test_bayu" | \
  "Merge branch '\''ml'\'' of "* | \
  "fix: kembalikan struktur folder ke dalam ML dan restore requirements.txt" | \
  "feat(ml): lengkapi modul preprocessing dan modelling untuk integrasi Backend" | \
  "Merge latest changes and keep relative import fix" | \
  "feat(api): tambah kecerdasan template dinamis dan endpoint bulk-future" | \
  "feat(monitoring): tambah monitoring Prometheus + Grafana dengan 5 metrik utama (request count, latency, error rate, distribusi prediksi, CPU/RAM)" | \
  "Update README.md" | \
  "Undo: Batalkan ekstraksi model dan kembalikan ke mlflow" | \
  "feat(ml): update bulk prediction and excel processing logic" | \
  "test test test" | \
  "chore(ml): clean up branch, remove WD folder")
    export GIT_AUTHOR_NAME="bayuimantoro"
    export GIT_AUTHOR_EMAIL="167949958+bayuimantoro@users.noreply.github.com"
    export GIT_COMMITTER_NAME="bayuimantoro"
    export GIT_COMMITTER_EMAIL="167949958+bayuimantoro@users.noreply.github.com"
    ;;
  "Menambahkan script untuk extract model, dan membuat file requirements-prod.txt yang diperuntukan untuk deploy" | \
  "feat(api): uji coba FastAPI server untuk production serving" | \
  "feat(src): tambah pemrosesan Excel massal dan simulasi ekstrapolasi masa depan" | \
  "feat(ml): penambahan visualisasi EDA dan inisialisasi struktur src/" | \
  "chore: menghapus file konfigurasi vscode lokal" | \
  "feat(ml): preprocessing, eksperimen model random forest, dan update dokumentasi" | \
  "chore: add .gitignore to exclude ML folder and build artifacts from wd branch" | \
  "chore(wd): clean up branch, remove ML folder" | \
  "chore: remove unnecessary Python bytecode cache file" | \
  "chore: generate package-lock.json for dependency tracking" | \
  "Feat: add Excel template download and collective Excel import with bulk analysis for Kader Posyandu" | \
  "Docs: add root README.md with setup and execution instructions for collaborators" | \
  "Fix: convert backend submodule reference to regular directory and add files" | \
  "chore: include both WD and ML directories in main branch" | \
  "chore: untrack and ignore ML/ directory on wd branch" | \
  *"Undo: Batalkan"*)
    export GIT_AUTHOR_NAME="Rian Putra Pratama"
    export GIT_AUTHOR_EMAIL="rianputrapratama666@gmail.com"
    export GIT_COMMITTER_NAME="Rian Putra Pratama"
    export GIT_COMMITTER_EMAIL="rianputrapratama666@gmail.com"
    ;;
  "feat(data): implement rule-based synthetic data generation & cleanse raw labels" | \
  "refactor: remove bulk Excel processing from InputForm and add template file for data entry" | \
  "dataset update" | \
  "fix: membersihkan anomali data BB dan update model random forest" | \
  "Inisialisasi struktur folder ML, penambahan dataset mentah, data dummy, dan feature engineering")
    export GIT_AUTHOR_NAME="KimAkimMan"
    export GIT_AUTHOR_EMAIL="186290894+KimAkimMan@users.noreply.github.com"
    export GIT_COMMITTER_NAME="KimAkimMan"
    export GIT_COMMITTER_EMAIL="186290894+KimAkimMan@users.noreply.github.com"
    ;;
  *)
    export GIT_AUTHOR_NAME="Muhammad Rizal Nurfirdaus"
    export GIT_AUTHOR_EMAIL="167951554+MuhammadRizalNurfirdaus@users.noreply.github.com"
    export GIT_COMMITTER_NAME="Muhammad Rizal Nurfirdaus"
    export GIT_COMMITTER_EMAIL="167951554+MuhammadRizalNurfirdaus@users.noreply.github.com"
    ;;
esac
' -- --all

echo "=== Verification of commit distribution on main ==="
git log main --no-merges --format="%an <%ae>" | sort | uniq -c | sort -rn
