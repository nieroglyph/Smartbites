# Smartbites
hello worlds my worlds

1️⃣ Generate a New SSH Key

Run this command in Git Bash:

ssh-keygen -t rsa -b 4096 -C "permisonmarkdenzel12@gmail.com"

    Replace "your-email@example.com" with your actual GitHub email.
    When prompted, press Enter to accept the default file location.
    If asked for a passphrase, you can either enter one (for extra security) or leave it empty.

2️⃣ Start the SSH Agent & Add the Key

Run:

eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

3️⃣ Add Your SSH Key to GitHub

Copy your SSH public key:

cat ~/.ssh/id_rsa.pub

    Copy the entire output.
    Go to GitHub SSH Keys.
    Click New SSH Key, give it a title, paste the key, and save.

4️⃣ Test the Connection

Run:

ssh -T git@github.com

If successful, you'll see:

    "Hi <your-username>! You've successfully authenticated"

5️⃣ Try Pushing Again

Now, try pushing your code again:

git push origin main

This should work now! Let me know if you hit any issues. 🚀
You said:
Thanks, now that I have set up my repository. How do I collab with other developers on github?
ChatGPT said:

Awesome! Now that your repository is set up, here’s how you can collaborate with other developers on GitHub:
👥 1. Add Collaborators (For Private Repos)

If your repo is private, you need to invite collaborators:

    Go to your GitHub repo → Click Settings → Collaborators.
    Click "Add people", enter their GitHub username/email, and invite them.
    They will receive an invite link to accept.

For public repos, anyone can fork and contribute without an invite.
🌿 2. Work with Branches (Best Practice)

Instead of working directly on main, create a new branch for your feature:

git checkout -b feature-branch

Make changes, commit them, and push the branch:

git add .
git commit -m "Added new feature"
git push origin feature-branch

🔄 3. Open a Pull Request (PR)

After pushing your branch to GitHub:

    Go to your GitHub repo → Click Pull Requests → New Pull Request.
    Select your branch and compare it with main.
    Add a description and click Create Pull Request.
    Team members can review, suggest changes, and approve it.

🔀 4. Merge Changes to main

Once the PR is reviewed and approved:

    Click Merge Pull Request on GitHub.
    After merging, delete the branch:

git branch -d feature-branch
git push origin --delete feature-branch

🔄 5. Keep Your Local Repo Updated

Before working on new features, always sync your local repo:

git checkout main
git pull origin main

This ensures you have the latest code.
