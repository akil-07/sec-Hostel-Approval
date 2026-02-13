# 🔐 Fix: Grant Drive Permissions

The error `You do not have permission to call DriveApp.createFile` happens because you added code to use Google Drive, but you haven't **authorized** the script to access your Drive yet.

### Step 1: Authorize the Script
1.  Open your **Google Apps Script** editor (Extensions > Apps Script).
2.  In the toolbar, locate the dropdown menu that says `doPost` or `doGet`.
3.  Change it to select **`testDrivePermission`** (if you don't see it, paste the code below at the bottom of your script).
    ```javascript
    function testDrivePermission() {
      DriveApp.getRootFolder();
      Logger.log("Permissions are good!");
    }
    ```
4.  Click the **▷ Run** button.
5.  A popup will appear saying "Authorization Required".
6.  Click **Review Permissions**.
7.  Select your Google Account.
8.  (If you see "Google hasn't verified this app", click **Advanced** > **Go to ... (unsafe)**).
9.  Click **Allow** to grant access to Google Drive.

### Step 2: Redeploy (Essential!)
After authorizing, you **MUST** update the deployment for the permissions to take effect on the live app.

1.  Click **Deploy** > **Manage Deployments**.
2.  Click the **Pencil Icon** (Edit).
3.  **Version:** Select **"New version"**.
4.  Click **Deploy**.

### Step 3: Test Again
Now that the script has permission to write to your Drive, try submitting a request from the app again. The "Upload Error" in your Google Sheet should disappear, replaced by a valid Drive link!
