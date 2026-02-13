# 🧪 Final Test: Verify Everything

Since you have updated the deployment, everything should now work perfectly!

### 1. Clear Your Terminals
I noticed you might have multiple servers running. To avoid confusion:
1.  Go to your VS Code terminal.
2.  Click the **Trash Can icon** 🗑️ on **ALL** open terminals to kill them.
3.  Open a new terminal (`Ctrl + \``).
4.  Run: `npm run dev`

### 2. Test the System
1.  Open the App in your browser (usually `http://localhost:5173`).
2.  **Log in** as a Student.
3.  Fill out the Leave Form.
4.  **Upload a Letter** (Image).
5.  Click **Submit**.

### 3. Verification Checklist
- [ ] **App:** Did it say "Submitted Successfully" and appear in the dashboard instantly? (This confirms Firebase works).
- [ ] **Excel:** Open your Google Sheet. Do you see a new row with a **Clickable Drive Link** in the "Letter Image URL" column? (This confirms Google Script works).
- [ ] **Drive:** Click the link. Does it open the image? (This confirms Permissions works).

If all 3 are YES, you are done! 🚀
