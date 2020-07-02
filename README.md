# Skynet-cmpt470

Skynet is a web-based messaging application. Its main feature is live drawing broadcasted to multiple users.

# Usage 
To start a lecture, you need to:
1.  sign up or log in
2.  create a lecture, give it a name and upload an image (i.e. .jpg, .jpeg, etc.)
3.  select the lecture from the lectures page
4.  start doodling ...


# WebStorm Configuration
1. Go to: 
    Menu bar > Run > Edit Configurations... 
2. Add a NodeJS Template
3. Type "bin/www" in front of JavaScript file field

# Workflow Guidline
### Master Branch
There shouldn’t be any direct push to Master branch. Master should always run properly. 

### Writing Code 
If the problem you want to solve is not mentioned under the issues list:
1. Create an issue, 
2. Make a branch under that issue, 
3. Write code, and 
4. request a merge to Master branch. 

### Main Issues
The main issues are way too big to be solved in one go. Those issues should be Work In Progress. That means the merge request won't be closed after a merge into Masterbranch. 

If you want to add code to a WIP branch:
1. Fork a branch from it, 
1. Write code, and  
1. Request a merge to the WIP branch. 

### Merging Procedure 

1. Request a merge request using Gitlab UI
2. Others will Review your code, and give you a thumbs up or a comment, and 
3. You merge or ask another person to merge the branch.

This way everyone is responsible for the whole code.

