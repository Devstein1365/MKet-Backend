So on opening the frontend URL, you will get to see the home page
when you click the get started or login button, it takes sus to the auth page which has both the signup and login together.
The auth page has form to be filled, both on the login and sign up tabs.
On the signup tab, we have the following inputs: fullname, studentId, matric number, futminna email, password, confirm password
the fullname is either two or three names, the futminna email is formed fromed the studentId and the student last name only then there's already stagnant domain there only (@st.futminna.edu.ng), but the student can still edit the names before the domain in case if it doesn't match their actuall user email, so there's kind of be a prompting for the user to know that the email generated is editable or maybe it's gotten from the user last name and the student Id. The format of the email is like this (oligwu.m2203183@futminna.edu.ng) for a user let's say that is name is Oga Gospel Oligwu with a student ID of 2022/1/87761ET.
for the password,it has to be atleast : 8 characters, one uppercase, on lowercase, one number, one symbol and then also the confirm password, though I have added prompting for all that, so the user can know whilst typing.
I am also, thinking, I don't think that Matric number might be needed instead change it to phone number. Now also, I want there's should be a verification after the user has filled in all this details, a mail should be sent to the provided email be able confirm their email or maybe an OTP should be sent to the number to confirm their phone number. or should we do this after there are logged in to verify their details?. (which is better).
The last input is the checkbox for I agree to the terms and conditions.
ALl this input already have their validation messages and warning.

for the LOGIN
it takes in the email addresss and the password which has already been created and stored in the database, please ensure that the datas sync. Also then there's a checkbox for remember me.
lastly in the login, we have the forgot password which takes us to the forgot password page that takes in three input, the email address and then the new password and confirm new passord which then, the user clicks the reset password password button, a mail should be sent which confirms that the password has been reset. or maybe we can just change the frontend to when the user clicks the forgot password, it takes them to the forgot password page and then the user input the email and clicks reset password, a password is sent to their mail, of which when they login, they can later reset from settings. (which do you think is better, for me I prefer the second, but you can tell which would be better.)


things to note for the auth, under the sign up the user must use atleast two names for the full name input. the fumminna email should be editable just incase it doesn't fits what the user is actually using, so there should be a warning to make the user aware.
in the forget password, any email that's not in the database and the user inputs that, the message provided should be invalid email to avoid users signing up from forget password page.
the matric number in the signup form should be changed to phone number in the frontend which accpets only 11 digits.

what so you think is possible to use for the email verification or phone number verification, are there 3rd parties website or API's to use for this?

ALl these are for the auth page before logging into the dashboard.

Dashboard and other pages (home, wishlist, chat, profiles)
In the dashboard or any other pages you can see bottom nav bar which holds the home, wishlist, post, chats and profiles page.
By defaultm if there are not products in the database the user won't see any products, but if there products, the user will see them.
Now in the profiles page, the user see their name which they used for signing up, and then the user can add a little bio about themselves. (the bio shouldn't be more than 120 words). 
by default, since there's now profile picture, the profile picture should be the first letter of the user's first and last name with a color at the background (the color should be a random one and should caries as user signs up). There's also space for editing the phone number and also location, by default, all location should be not selected (I will update the location later). After all these the user clicks save which updates all the data. ensure you go through the frontend folders and files to get everything I am saying just incase I miss anything also, so you can provide the right schema, from the login and signup.
In the profile page when the user clicks setting, they can change their password and notification settings. the theme and language would be worked on later.
A user can also creates prpoducts as a seller or purchase a products as buyer.
for the user to sell, products, they have to go the post page to post a product.
on the post a product page, we have the following
*an image to be uploaded, with max of 6 images
*A product details
*description which can be assisted with the help of AI
*categories of the products
*Conditions (new, used, fairly used)
*Pricing (selling price & Original price)
*Location
all these inputs are required.
of which the user can save to draft, they can also preview how it would look for other users, and then they can also post their products so other users can see.
Now concerning the AI generating description, that's already integrating LLM into our project, we would be using GEMINI. I would love the AI to help in generating description after the user has filled all the info. so update the frontend code, that all info must be filled for the AI to be activated for click, cause it's like the description is not required to use the AI, but now please include it. Is it possible to make the AI read the image so that someone won't upload maybe hard drugs or sth else, before using the AI generation, if that's possible fine, if not, just leave it then.

now when a user sees a product, 
the product shows the image, the product's name, the price, the location, the condition (new, used and fairly used), the user's name(the user who posted that product) and verification status.
they click on the products, it which takes them to the products page which shows more details, like the user name and chat up button, the images of the products and eveyrthing (location, number of views, date posted), view user profile button, report user button, share.
On clicking view profile button it takes them to the view page of the the profile to see th full details of the profiles, you can go through the frontend code int details to get everything I am saying



📋 NEXT STEPS - Backend Implementation:
Phase 1: Authentication (Priority 1) 🔐

Create auth controller (register, login, verify email, resend verification)
Create auth middleware (protect routes with JWT)
Setup Nodemailer for emails
Implement password reset flow
Test with frontend
Phase 2: User Profile 👤

Get profile endpoint
Update profile (bio, location, phone, avatar)
Change password
Update settings (notifications)
Phase 3: Products 📦

Create product (with Cloudinary upload + AI moderation)
Get all products (with filters, pagination)
Get product by ID
Update product
Delete product (soft delete)
Mark as sold
Phase 4: Real-time Chat 💬

Setup Socket.io
Create conversation endpoint
Send message (real-time)
Get conversations
Get messages
Mark as read
Phase 5: Supporting Features ⭐

Wishlist (add/remove/get)
Reviews (add/get/delete)
Notifications (create/get/mark read)
Reports (create/get)
