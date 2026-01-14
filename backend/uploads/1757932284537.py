import time
import smtplib
from datetime import datetime
import tkinter as tk
from tkinter import Frame, filedialog, ttk, messagebox, font
import mysql.connector
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'file_app_user',
    'password': 'Hell0W0Rld',
    'database': 'file_register_db'
}

class ResponsiveApp:
    def __init__(self, root):
        self.root = root
        
        self.setup_main_window()
        self.create_widgets()
        self.test_db_connection()
        
    def setup_main_window(self):
        """Configure the main window properties"""
        self.root.title("File Movement Register")
        
        # Make the window fullscreen
        self.root.state('zoomed')  # For Windows
        # For Linux/Mac: self.root.attributes('-zoomed', True)
        
        # Get screen dimensions
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        
        # Set default size (will expand to fullscreen)
        self.root.geometry(f"{int(screen_width*0.8)}x{int(screen_height*0.8)}")
        
        # Configure the grid to be responsive
        self.root.grid_columnconfigure(0, weight=1)
        self.root.grid_columnconfigure(1, weight=1)
        self.root.grid_columnconfigure(2, weight=1)
        
        # Set background and style
        self.root.configure(bg='#e6f2ff')  # Light blue background
        
        # Create custom fonts
        self.title_font = font.Font(family="Helvetica", size=16, weight="bold")
        self.label_font = font.Font(family="Helvetica", size=12)
        self.button_font = font.Font(family="Helvetica", size=12, weight="bold")
        
        # Configure ttk styles
        self.style = ttk.Style()
        self.style.configure('TEntry', padding=5)
        self.style.configure('TButton', padding=10)
        
    def create_widgets(self):
        """Create all UI elements"""
        # Create a title label
        title_label = tk.Label(self.root, text="File Movement Register", 
                              font=self.title_font, bg='#e6f2ff', fg='#003366')
        title_label.grid(row=0, column=0, columnspan=3, pady=20)
        
        # Create main frames
        self.input_frame = tk.Frame(self.root, bg='#e6f2ff', padx=20, pady=20,
                                  highlightbackground='#99ccff', highlightthickness=1)
        self.input_frame.grid(row=1, column=0, columnspan=3, sticky="nsew", padx=40, pady=10)
        self.input_frame.grid_columnconfigure(0, weight=1)
        self.input_frame.grid_columnconfigure(1, weight=2)
        
        # Create a form using grid for better alignment
        # Username
        row = 0
        username_label = tk.Label(self.input_frame, text="Username:", bg='#e6f2ff', 
                           font=self.label_font, anchor="e")
        username_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.username_entry = ttk.Entry(self.input_frame, width=40, font=self.label_font)
        self.username_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)
        
        # Password
        row += 1
        password_label = tk.Label(self.input_frame, text="Password:", bg='#e6f2ff', 
                             font=self.label_font, anchor="e")
        password_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.password_entry = ttk.Entry(self.input_frame, width=40, font=self.label_font, show="*")
        self.password_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)
        
        # Create buttons frame
        button_frame = tk.Frame(self.root, bg='#e6f2ff', pady=20)
        button_frame.grid(row=2, column=0, columnspan=4, sticky="ew")
        button_frame.grid_columnconfigure(0, weight=1)
        button_frame.grid_columnconfigure(1, weight=1)
        
        # Login button with improved styling
        self.login_button = tk.Button(button_frame, text="LOGIN", command=self.login,
                              bg='#4CAF50', fg='white', width=20, height=2,
                              font=self.button_font, relief=tk.RAISED,
                              activebackground='#45a049', cursor="hand2")
        self.login_button.grid(row=0, column=0, padx=20, pady=20)
        
        # Sign up button with improved styling
        self.signup_button = tk.Button(button_frame, text="SIGN UP", command=self.open_signup_window,
                             bg='#2196F3', fg='white', width=20, height=2,
                             font=self.button_font, relief=tk.RAISED,
                             activebackground='#0b7dda', cursor="hand2")
        self.signup_button.grid(row=0, column=1, padx=20, pady=20)
        
        # Status bar at the bottom
        self.status_frame = tk.Frame(self.root, bg='#003366', height=30)
        self.status_frame.grid(row=3, column=0, columnspan=3, sticky="ew")
        
        self.db_status_label = tk.Label(self.status_frame, text="Database Status: Checking...", 
                                      bg='#003366', fg='white', anchor="w", padx=10)
        self.db_status_label.pack(side=tk.LEFT, fill=tk.X)
        
    def test_db_connection(self):
        """Test database connection and update status"""
        conn = self.connect_to_db()
        if conn:
            self.db_status_label.config(text="✓ Database connected", fg='#8eff8e')
            conn.close()
        else:
            self.db_status_label.config(text="✗ Database not connected", fg='#ff8e8e')
        
        # Schedule next check
        self.root.after(60000, self.test_db_connection)  # Check every minute
        
    def connect_to_db(self):
        """Create and return a database connection"""
        try:
            conn = mysql.connector.connect(**DB_CONFIG)
            return conn
        except mysql.connector.Error as err:
            messagebox.showerror("Database Connection Error", f"Failed to connect to database: {err}")
            return None
            
    def login(self):
        """Handle user login and redirect to appropriate screen"""
        username = self.username_entry.get()
        password = self.password_entry.get()

        # Validate inputs
        if not all([username, password]):
            messagebox.showerror("Invalid Input", "Please fill in all required fields.")
            return
            
        # For demo purposes, hardcoded admin login
        # if username == 'admin' and password == '123':
        #     messagebox.showinfo("Login", "Login successful")
        #     self.root.withdraw()  # Hide the login window
        #     self.open_add_file_window()  # Open the add file window directly after login
        # else:
            # For a real implementation, check credentials against database
        conn = self.connect_to_db()
        if not conn:
                return
                
        try:
                cursor = conn.cursor()
                # query = "SELECT * FROM signup WHERE username = %s AND passwd = %s"
                query = "SELECT username,passwd FROM signup WHERE username = %s AND passwd = %s"
                cursor.execute(query, (username, password))
                result = cursor.fetchone()
                
                if result:
                    messagebox.showinfo("Login", "Login successful")
                    self.root.withdraw()  # Hide the login window
                    self.open_add_file_window()  # Open add file window after login
                else:
                    messagebox.showerror("Login Failed", "Incorrect username or password.")
        except mysql.connector.Error as err:
                messagebox.showerror("Database Error", f"Failed to validate login: {err}")
        finally:
                if conn.is_connected():
                    cursor.close()
                    conn.close()

    def open_signup_window(self):
        """Open the signup window"""
        signup_window = tk.Toplevel(self.root)
        signup_window.title("Sign Up Form")
        
        # Make the new window fullscreen as well
        signup_window.state('zoomed')

        signup_window.grid_columnconfigure(0, weight=1)
        signup_window.grid_rowconfigure(1, weight=1)
        
        signup_window.configure(bg='#e6f2ff')
        
        # Title frame
        title_frame = tk.Frame(signup_window, bg='#003366', pady=10)
        title_frame.grid(row=0, column=0, sticky="ew")
        
        title_label = tk.Label(title_frame, text="SIGN UP FORM", 
                             font=self.title_font, bg='#003366', fg='white')
        title_label.pack()

        # Create main frames
        input_frame = tk.Frame(signup_window, bg='#e6f2ff', padx=20, pady=20,
                              highlightbackground='#99ccff', highlightthickness=1)
        input_frame.grid(row=1, column=0, sticky="nsew", padx=40, pady=10)
        input_frame.grid_columnconfigure(0, weight=1)
        
        # Username field
        username_label = tk.Label(input_frame, text="Username", bg='#e6f2ff', font=self.label_font)
        username_label.pack(pady=(10, 5))
        self.signup_username_entry = ttk.Entry(input_frame, width=40, font=self.label_font)
        self.signup_username_entry.pack(pady=(0, 10))
        
        # Password field
        password_label = tk.Label(input_frame, text="Password", bg='#e6f2ff', font=self.label_font)
        password_label.pack(pady=(10, 5))
        self.signup_password_entry = ttk.Entry(input_frame, width=40, font=self.label_font, show="*")
        self.signup_password_entry.pack(pady=(0, 10))
        
        # Email field
        email_label = tk.Label(input_frame, text="Email", bg='#e6f2ff', font=self.label_font)
        email_label.pack(pady=(10, 5))
        self.signup_email_entry = ttk.Entry(input_frame, width=40, font=self.label_font)
        self.signup_email_entry.pack(pady=(0, 10))
        
        # Department field
        department_label = tk.Label(input_frame, text="Department", bg='#e6f2ff', font=self.label_font)
        department_label.pack(pady=(10, 5))
        self.signup_department_entry = ttk.Entry(input_frame, width=40, font=self.label_font)
        self.signup_department_entry.pack(pady=(0, 10))
        
        # Signup button
        signup_button = tk.Button(input_frame, text="SIGN UP", command=lambda: self.register(signup_window),
                                bg='#2196F3', fg='white', width=20, height=2,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#0b7dda', cursor="hand2")
        signup_button.pack(pady=15)
        
        # Back to login button
        back_button = tk.Button(input_frame, text="BACK TO LOGIN", command=signup_window.destroy,
                              bg='#2196E3', fg='white', width=20, height=2,
                              font=self.button_font, relief=tk.RAISED,
                              activebackground='#0b7dda', cursor="hand2")
        back_button.pack(pady=10)
    
    def register(self, signup_window):
        """Register a new user"""
        username = self.signup_username_entry.get()
        password = self.signup_password_entry.get()
        email = self.signup_email_entry.get()
        department = self.signup_department_entry.get()
        
        # Validate inputs
        if not all([username, password, email, department]):
            messagebox.showerror("Invalid Input", "Please fill in all required fields.")
            return
        
        # Connect to database
        conn = self.connect_to_db()
        if not conn:
            return
            
        try:
            cursor = conn.cursor()
            
            # Check if username already exists
            cursor.execute("SELECT username FROM signup WHERE username = %s", (username,))
            if cursor.fetchone():
                messagebox.showerror("Registration Error", "Username already exists!")
                return
                
            # Insert data into database
            query = """
            INSERT INTO signup (username, passwd, email, department)
            VALUES (%s, %s, %s, %s)
            """
            values = (username, password, email, department)
            
            cursor.execute(query, values)
            conn.commit()
            
            messagebox.showinfo("Success", "Registration successful! You can now login.")
            signup_window.destroy()  # Close signup window
            
        except mysql.connector.Error as err:
            messagebox.showerror("Database Error", f"Failed to register user: {err}")
        finally:
            if conn.is_connected():
                cursor.close()
                conn.close()
                
    def open_add_file_window(self):
        """Open window to add a new file"""
        add_file_window = tk.Toplevel(self.root)
        add_file_window.title("Add File Information")
        
        # Make the window fullscreen
        add_file_window.state('zoomed')
        
        # Configure the grid
        add_file_window.grid_columnconfigure(0, weight=1)
        add_file_window.grid_rowconfigure(1, weight=1)
        
        add_file_window.configure(bg='#e6f2ff')
        
        # Title frame
        title_frame = tk.Frame(add_file_window, bg='#003366', pady=10)
        title_frame.grid(row=0, column=0, sticky="ew")
        
        title_label = tk.Label(title_frame, text="Add File Information", 
                             font=self.title_font, bg='#003366', fg='white')
        title_label.pack()
        
        # Main content frame
        content_frame = tk.Frame(add_file_window, bg='#e6f2ff', padx=20, pady=20,
                               highlightbackground='#99ccff', highlightthickness=1)
        content_frame.grid(row=1, column=0, sticky="nsew", padx=40, pady=10)
        content_frame.grid_columnconfigure(0, weight=1)
        content_frame.grid_columnconfigure(1, weight=2)
        
        # Create form fields
        # File ID
        row = 0
        file_id_label = tk.Label(content_frame, text="File ID:", bg='#e6f2ff', 
                               font=self.label_font, anchor="e")
        file_id_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.id_entry = ttk.Entry(content_frame, width=40, font=self.label_font)
        self.id_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)
        
        # File Name
        row += 1
        name_label = tk.Label(content_frame, text="File Name:", bg='#e6f2ff', 
                            font=self.label_font, anchor="e")
        name_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.name_entry = ttk.Entry(content_frame, width=40, font=self.label_font)
        self.name_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)
        
        # Sender
        row += 1
        sender_label = tk.Label(content_frame, text="From (Sender):", bg='#e6f2ff', 
                              font=self.label_font, anchor="e")
        sender_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.sender_entry = ttk.Entry(content_frame, width=40, font=self.label_font)
        self.sender_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)
        
        # Receiver
        row += 1
        receiver_label = tk.Label(content_frame, text="To (Receiver):", bg='#e6f2ff', 
                                font=self.label_font, anchor="e")
        receiver_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.receiver_entry = ttk.Entry(content_frame, width=40, font=self.label_font)
        self.receiver_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)
        
        # Despatched To
        row += 1
        despatch_label = tk.Label(content_frame, text="Despatched To:", bg='#e6f2ff', 
                                font=self.label_font, anchor="e")
        despatch_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.despatch_entry = ttk.Entry(content_frame, width=40, font=self.label_font)
        self.despatch_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)
        
        # Remarks
        row += 1
        remarks_label = tk.Label(content_frame, text="Remarks:", bg='#e6f2ff', 
                               font=self.label_font, anchor="e")
        remarks_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.remarks_entry = ttk.Entry(content_frame, width=40, font=self.label_font)
        self.remarks_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)

      
        row += 1
        inwardnum_label = tk.Label(content_frame, text="Inward Num:", bg='#e6f2ff', 
                            font=self.label_font, anchor="e")
        inwardnum_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.inwardnum_entry = ttk.Entry(content_frame, width=40, font=self.label_font)
        self.inwardnum_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)

        row += 1
        outwardnum_label = tk.Label(content_frame, text="Outward Num:", bg='#e6f2ff', 
                            font=self.label_font, anchor="e")
        outwardnum_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.outwardnum_entry = ttk.Entry(content_frame, width=40, font=self.label_font)
        self.outwardnum_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)

               
        # Buttons frame
        buttons_frame = tk.Frame(add_file_window, bg='#e6f2ff', pady=20)
        buttons_frame.grid(row=2, column=0, sticky="ew")
        buttons_frame.grid_columnconfigure(0, weight=1)
        buttons_frame.grid_columnconfigure(1, weight=1)
        
        # Submit button
        submit_button = tk.Button(buttons_frame, text="SUBMIT", command=self.add_file,
                                bg='#4CAF50', fg='white', width=20, height=2,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#45a049', cursor="hand2")
        submit_button.grid(row=0, column=0, padx=20, pady=20)
        
        # View Register button
        view_button = tk.Button(buttons_frame, text="VIEW REGISTER", 
                              command=lambda: self.open_treeview_window(add_file_window),
                              bg='#2196F3', fg='white', width=20, height=2,
                              font=self.button_font, relief=tk.RAISED,
                              activebackground='#0b7dda', cursor="hand2")
        view_button.grid(row=0, column=1, padx=20, pady=20)
        
        # Logout button
        logout_button = tk.Button(buttons_frame, text="LOGOUT",
                                command=lambda: self.logout(add_file_window),
                                bg='#f44336', fg='white', width=20, height=2,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#d32f2f', cursor="hand2")
        logout_button.grid(row=0, column=2, padx=20, pady=20)
        
        # Prevent closing the window from X button without proper logout
        add_file_window.protocol("WM_DELETE_WINDOW", lambda: self.logout(add_file_window))
        
        return add_file_window
    
    def logout(self, window):
        """Handle logout and return to login screen"""
        result = messagebox.askquestion("Logout", "Are you sure you want to logout?")
        if result == 'yes':
            window.destroy()
            self.root.deiconify()  # Show login window again
            self.username_entry.delete(0, tk.END)
            self.password_entry.delete(0, tk.END)
    
    def add_file(self):
        """Add a new file to the database"""
        try: 
            fileid = self.id_entry.get()
            name = self.name_entry.get()
            sender = self.sender_entry.get()
            receiver = self.receiver_entry.get()
            despatch = self.despatch_entry.get()
            remarks = self.remarks_entry.get()
            inwardnum = self.inwardnum_entry.get()
            outwardnum = self.outwardnum_entry.get()
            
            # Validate inputs
            if not all([fileid, name, sender, receiver]):
                messagebox.showerror("Invalid Input", "Please fill in all required fields.")
                return
                
            print(f"Adding file: {name} from {sender} to {receiver}")    
            date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Connect to database
            conn = self.connect_to_db()
            if not conn:
                return
                
            try:
                cursor = conn.cursor()
                
                # Insert data into database
                query = """
                INSERT INTO files (file_id, file_name, sender, receiver, despatched_to, date_added, remarks,inwardnum,outwardnum)
                VALUES (%s, %s, %s, %s, %s, %s, %s,%s,%s)
                """
                values = (fileid, name, sender, receiver, despatch, date, remarks,inwardnum,outwardnum)
                
                cursor.execute(query, values)
                conn.commit()
                
                print("File added successfully to database.")
                messagebox.showinfo("Success", "File added successfully to database.")
                
                # Send email notification
                self.send_email(name)
                
                # Clear entries after successful submission
                self.id_entry.delete(0, tk.END)
                self.name_entry.delete(0, tk.END)
                self.sender_entry.delete(0, tk.END)
                self.receiver_entry.delete(0, tk.END)
                self.despatch_entry.delete(0, tk.END)
                self.remarks_entry.delete(0, tk.END)
                self.inwardnum_entry.delete(0, tk.END)
                self.outwardnum_entry.delete(0, tk.END)
                
            except mysql.connector.Error as err:
                print(f"Database error: {err}")
                messagebox.showerror("Database Error", f"Failed to add file to database:\n{err}")
            finally:
                if conn.is_connected():
                    cursor.close()
                    conn.close()
          
        except ValueError as e:
            print(f'Invalid input: {e}')
            messagebox.showerror("Invalid Input", "Please enter valid input values.")
            return
            
    def send_email(self, name):
        """Send notification email about file update"""
        try: 
            print(f"Sending email about file: {name}")
            messagebox.showinfo("Sending Email", f"Sending email about file: {name}")
        except ValueError:
            print('Invalid input')
            messagebox.showerror("Invalid Input", "Please enter a valid name.")
            return
        
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
        sender_email = 'ssreelekshmi09@gmail.com'
        receiver_email = ["sreelek24@gmail.com", "ganeshsree2010@gmail.com", "vsreeprakash@gmail.com"]
        password = 'xskv nmom wbyh eyyg'  # Use an app password, not your main password
        
        # Create message
        message = MIMEMultipart()
        message['From'] = sender_email
        message['To'] = ", ".join(receiver_email)
        message['Subject'] = 'File Received'

        # Email body         
        body = name + ' updated!'
        message.attach(MIMEText(body, 'plain'))

        # Send email
        try:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()  # Secure the connection
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message.as_string())
            print("Email sent successfully!")
            messagebox.showinfo("Success", "Email sent successfully!")
            
        except Exception as e:
            print("Failed to send email:", e)
            messagebox.showerror("Error", f"Failed to send email:\n{e}")
        finally:
            if 'server' in locals():
                server.quit()

    def open_treeview_window(self, parent_window=None):
        """Open a new window with treeview to display database data"""
        treeview_window = tk.Toplevel(self.root)
        treeview_window.title("File Register Data")
        
        # Make the new window fullscreen as well
        treeview_window.state('zoomed')
        
        # Configure the grid
        treeview_window.grid_columnconfigure(0, weight=1)
        treeview_window.grid_rowconfigure(1, weight=1)  # Give the treeview area most of the space
        
        treeview_window.configure(bg='#e6f2ff')
        
        # Title frame
        title_frame = tk.Frame(treeview_window, bg='#003366', pady=10)
        title_frame.grid(row=0, column=0, sticky="ew")
        
        title_label = tk.Label(title_frame, text="File Register Data", 
                             font=self.title_font, bg='#003366', fg='white')
        title_label.pack()
        
        # Main content area with Treeview
        content_frame = tk.Frame(treeview_window, bg='#e6f2ff', padx=20, pady=10)
        content_frame.grid(row=1, column=0, sticky="nsew")
        content_frame.grid_columnconfigure(0, weight=1)
        content_frame.grid_rowconfigure(0, weight=1)
        
        # Create Treeview with scrollbars
        tree_frame = tk.Frame(content_frame)
        tree_frame.grid(row=0, column=0, sticky="nsew")
        
        # Create Treeview with multiselect enabled
        tree = ttk.Treeview(tree_frame, selectmode='extended')  # 'extended' allows multiple selection
        
        # Add scrollbars
        vsb = ttk.Scrollbar(tree_frame, orient="vertical", command=tree.yview)
        hsb = ttk.Scrollbar(tree_frame, orient="horizontal", command=tree.xview)
        tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
        
        # Grid layout for treeview with scrollbars
        tree.grid(row=0, column=0, sticky="nsew")
        vsb.grid(row=0, column=1, sticky="ns")
        hsb.grid(row=1, column=0, sticky="ew")
        
        tree_frame.grid_rowconfigure(0, weight=1)
        tree_frame.grid_columnconfigure(0, weight=1)
        
        # Create search frame
        search_frame = tk.Frame(content_frame, bg='#e6f2ff', pady=10)
        search_frame.grid(row=1, column=0, sticky="ew")
        
        search_label = tk.Label(search_frame, text="Search:", bg='#e6f2ff', font=self.label_font)
        search_label.pack(side=tk.LEFT, padx=5)
        
        search_entry = ttk.Entry(search_frame, width=30, font=self.label_font)
        search_entry.pack(side=tk.LEFT, padx=5)
        
        # Function to search in Treeview
        def search_treeview(query):
            # Clear current selection
            tree.selection_remove(tree.selection())
            
            if not query:
                return
                
            items = tree.get_children()
            found = False
            
            for item in items:
                values = tree.item(item)['values']
                # Convert all values to string and search
                for value in values:
                    if query.lower() in str(value).lower():
                        tree.selection_set(item)
                        tree.focus(item)
                        tree.see(item)  # Ensure the found item is visible
                        found = True
                        break
                if found:
                    break
                    
            if not found:
                messagebox.showinfo("Search", f"No results found for '{query}'.")
        
        # Function to refresh treeview data
        def refresh_data():
            # Clear current data
            tree.delete(*tree.get_children())
            # Load data from database
            self.load_data_from_db(tree, status_label)
        
        search_button = tk.Button(search_frame, text="Search", 
                                command=lambda: search_treeview(search_entry.get()),
                                bg='#2196F3', fg='white', font=self.button_font, padx=10)
        search_button.pack(side=tk.LEFT, padx=10)
        
        refresh_button = tk.Button(search_frame, text="Refresh", command=refresh_data,
                                 bg='#4CAF50', fg='white', font=self.button_font, padx=10)
        refresh_button.pack(side=tk.LEFT, padx=10)
        
        # Selection indicator frame
        selection_frame = tk.Frame(content_frame, bg='#e6f2ff', pady=5)
        selection_frame.grid(row=2, column=0, sticky="ew")
        
        selection_label = tk.Label(selection_frame, text="Selected: None", bg='#e6f2ff', font=self.label_font)
        selection_label.pack(side=tk.LEFT)
        
        # Buttons frame
        buttons_frame = tk.Frame(content_frame, bg='#e6f2ff', pady=10)
        buttons_frame.grid(row=3, column=0, sticky="ew")
        buttons_frame.grid_columnconfigure(0, weight=1)
        buttons_frame.grid_columnconfigure(1, weight=1)
        buttons_frame.grid_columnconfigure(2, weight=1)
        
        # Edit button
        edit_button = tk.Button(buttons_frame, text="EDIT", command=lambda: self.edit_selected_file(tree),
                              bg='#FFA500', fg='white', width=15, height=1,
                              font=self.button_font, relief=tk.RAISED,
                              activebackground='#FF8C00', cursor="hand2")
        edit_button.grid(row=0, column=0, padx=10, pady=10)
        
        # Delete button
        delete_button = tk.Button(buttons_frame, text="DELETE", command=lambda: self.delete_selected_file(tree),
                                bg='#f44336', fg='white', width=15, height=1,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#d32f2f', cursor="hand2")
        delete_button.grid(row=0, column=1, padx=10, pady=10)
        
        # Export button
        export_button = tk.Button(buttons_frame, text="EXPORT", command=lambda: self.export_to_csv(tree),
                                bg='#4CAF50', fg='white', width=15, height=1,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#45a049', cursor="hand2")
        export_button.grid(row=0, column=2, padx=10, pady=10)
        
        # Back button
        back_button = tk.Button(buttons_frame, text="BACK", command=treeview_window.destroy,
                              bg='#2196E3', fg='white', width=15, height=1,
                              font=self.button_font, relief=tk.RAISED,
                              activebackground='#0b7dda', cursor="hand2")
        back_button.grid(row=0, column=3, padx=10, pady=10)
        
        # Status bar
        status_frame = tk.Frame(treeview_window, bg='#003366', height=30)
        status_frame.grid(row=2, column=0, sticky="ew")
        
        status_label = tk.Label(status_frame, text="Ready", bg='#003366', fg='white', anchor="w", padx=10)
        status_label.pack(side=tk.LEFT, fill=tk.X)
        
        # Define columns
        tree['columns'] = ('ID', 'file_id', 'file_name', 'sender', 'receiver', 'despatched_to', 'date_added', 'remarks','inwardnum','outwardnum')
        
        # Format columns
        tree.column('#0', width=0, stretch=tk.NO)  # Hidden column
        tree.column('ID', width=50, anchor=tk.CENTER)
        tree.column('file_id', width=100, anchor=tk.W)
        tree.column('file_name', width=150, anchor=tk.W)
        tree.column('sender', width=150, anchor=tk.W)
        tree.column('receiver', width=150, anchor=tk.W)
        tree.column('despatched_to', width=150, anchor=tk.W)
        tree.column('date_added', width=150, anchor=tk.W)
        tree.column('remarks', width=200, anchor=tk.W)
        tree.column('inwardnum', width=200, anchor=tk.W)
        tree.column('outwardnum', width=200, anchor=tk.W)
        
        # Create headings
        tree.heading('#0', text='', anchor=tk.CENTER)
        tree.heading('ID', text='ID', anchor=tk.CENTER)
        tree.heading('file_id', text='File ID', anchor=tk.CENTER)
        tree.heading('file_name', text='File Name', anchor=tk.CENTER)
        tree.heading('sender', text='From (Sender)', anchor=tk.CENTER)
        tree.heading('receiver', text='To (Receiver)', anchor=tk.CENTER)
        tree.heading('despatched_to', text='Despatched To', anchor=tk.CENTER)
        tree.heading('date_added', text='Date', anchor=tk.CENTER)
        tree.heading('remarks', text='Remarks', anchor=tk.CENTER)
        tree.heading('inwardnum', text='InwardNum', anchor=tk.CENTER)
        tree.heading('outwardnum', text='OutwardNum', anchor=tk.CENTER)
        
        # Update selection label when selection changes
        def on_tree_select(_):
            selected = tree.selection()
            if selected:
                # Update selection status
                selection_label.config(text=f"Selected: {len(selected)} item(s)")
            else:
                selection_label.config(text="Selected: None")
                
        # Bind selection event
        tree.bind('<<TreeviewSelect>>', on_tree_select)
        
        # Load data from database
        self.load_data_from_db(tree, status_label)
        
    def load_data_from_db(self, tree, status_label):
        """Load data from database into treeview"""
        # Clear existing data
        for i in tree.get_children():
            tree.delete(i)
            
        # Update status
        status_label.config(text="Loading data...")
        
        # Connect to database
        conn = self.connect_to_db()
        if not conn:
            status_label.config(text="Error connecting to database")
            return
            
        try:
            cursor = conn.cursor()
            
            # Get all files
            query = "SELECT * FROM files ORDER BY date_added DESC"
            cursor.execute(query)
            rows = cursor.fetchall()
            
            # Insert data into treeview
            for i, row in enumerate(rows):
                tree.insert('', 'end', values=row)
                
            status_label.config(text=f"Loaded {len(rows)} records")
            
        except mysql.connector.Error as err:
            status_label.config(text=f"Database error: {err}")
            messagebox.showerror("Database Error", f"Failed to load data: {err}")
        finally:
            if conn.is_connected():
                cursor.close()
                conn.close()
                
    def edit_selected_file(self, tree):
        """Edit the selected file"""
        selected = tree.selection()
        
        if not selected:
            messagebox.showinfo("Selection", "Please select a file to edit")
            return
            
        # For simplicity, only edit the first selected item if multiple are selected
        item = selected[0]
        values = tree.item(item, 'values')
        
        if not values:
            return
            
        # Create edit dialog
        edit_window = tk.Toplevel(self.root)
        edit_window.title("Edit File Information")
        edit_window.geometry("500x500")
        edit_window.configure(bg='#e6f2ff')
        
        # Create form
        form_frame = tk.Frame(edit_window, bg='#e6f2ff', padx=20, pady=20)
        form_frame.pack(fill=tk.BOTH, expand=True)
        
        # File ID
        tk.Label(form_frame, text="File ID:", bg='#e6f2ff', font=self.label_font).grid(row=0, column=0, sticky="e", padx=10, pady=5)
        edit_file_id = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_file_id.grid(row=0, column=1, sticky="w", padx=10, pady=5)
        edit_file_id.insert(0, values[1])  # Index 1 contains file_id
        
        # File Name
        tk.Label(form_frame, text="File Name:", bg='#e6f2ff', font=self.label_font).grid(row=1, column=0, sticky="e", padx=10, pady=5)
        edit_name = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_name.grid(row=1, column=1, sticky="w", padx=10, pady=5)
        edit_name.insert(0, values[2])  # Index 2 contains file_name
        
        # Sender
        tk.Label(form_frame, text="From (Sender):", bg='#e6f2ff', font=self.label_font).grid(row=2, column=0, sticky="e", padx=10, pady=5)
        edit_sender = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_sender.grid(row=2, column=1, sticky="w", padx=10, pady=5)
        edit_sender.insert(0, values[3])  # Index 3 contains sender
        
        # Receiver
        tk.Label(form_frame, text="To (Receiver):", bg='#e6f2ff', font=self.label_font).grid(row=3, column=0, sticky="e", padx=10, pady=5)
        edit_receiver = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_receiver.grid(row=3, column=1, sticky="w", padx=10, pady=5)
        edit_receiver.insert(0, values[4])  # Index 4 contains receiver
        
        # Despatched To
        tk.Label(form_frame, text="Despatched To:", bg='#e6f2ff', font=self.label_font).grid(row=4, column=0, sticky="e", padx=10, pady=5)
        edit_despatch = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_despatch.grid(row=4, column=1, sticky="w", padx=10, pady=5)
        edit_despatch.insert(0, values[5])  # Index 5 contains despatched_to
        
        # Remarks
        tk.Label(form_frame, text="Remarks:", bg='#e6f2ff', font=self.label_font).grid(row=5, column=0, sticky="e", padx=10, pady=5)
        edit_remarks = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_remarks.grid(row=5, column=1, sticky="w", padx=10, pady=5)
        edit_remarks.insert(0, values[7])  # Index 7 contains remarks

         # InwardNum
        tk.Label(form_frame, text="InwardNum:", bg='#e6f2ff', font=self.label_font).grid(row=6, column=0, sticky="e", padx=10, pady=5)
        edit_inwardnum = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_inwardnum.grid(row=6, column=1, sticky="w", padx=10, pady=5)
        edit_inwardnum.insert(0, values[8])  # Index 8 contains inwardnum
        
         # OutwardNum
        tk.Label(form_frame, text="OutwardNum:", bg='#e6f2ff', font=self.label_font).grid(row=7, column=0, sticky="e", padx=10, pady=5)
        edit_outwardnum = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_outwardnum.grid(row=7, column=1, sticky="w", padx=10, pady=5)
        edit_outwardnum.insert(0, values[9])  # Index 9 contains outwardnum
        
        # Update function
        def update_file():
            # Get updated values
            file_id = edit_file_id.get()
            name = edit_name.get()
            sender = edit_sender.get()
            receiver = edit_receiver.get()
            despatch = edit_despatch.get()
            remarks = edit_remarks.get()
            inwardnum = edit_inwardnum.get()
            outwardnum = edit_outwardnum.get()
           
            selected_items = tree.selection()
            id = tree.item(selected_items[0])["values"][0]

            # Validate
            if not all([file_id, name, sender, receiver]):
                messagebox.showerror("Invalid Input", "Please fill in all required fields.")
                return
                
            # Connect to database
            conn = self.connect_to_db()
            if not conn:
                return
                
            try:
                cursor = conn.cursor()
                date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                # Update data
                query = """
                UPDATE files 
                SET file_id = %s, file_name = %s, sender = %s, receiver = %s, 
                    despatched_to = %s, date_added=%s, remarks = %s,inwardnum = %s,outwardnum = %s
                WHERE id = %s
                """
                values = (file_id, name, sender, receiver, despatch, date, remarks, inwardnum,outwardnum, id)  # values[0] contains the ID
                
                cursor.execute(query, values)
                conn.commit()
                
                messagebox.showinfo("Success", "File information updated successfully.")
                
                # Refresh the treeview
                edit_window.destroy()
                self.load_data_from_db(tree, edit_window)
                
                # Close the edit window
                # edit_window.destroy()
                
            except mysql.connector.Error as err:
                messagebox.showerror("Database Error", f"Failed to update file: {err}")
            finally:
                if conn.is_connected():
                    cursor.close()
                    conn.close()
        
        # Buttons
        buttons_frame = tk.Frame(edit_window, bg='#e6f2ff', pady=10)
        buttons_frame.pack(fill=tk.X)
        
        update_button = tk.Button(buttons_frame, text="UPDATE", command=update_file,
                                bg='#4CAF50', fg='white', width=15, height=1,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#45a049', cursor="hand2")
        update_button.pack(side=tk.LEFT, padx=10)
        
        cancel_button = tk.Button(buttons_frame, text="CANCEL", command=edit_window.destroy,
                                bg='#f44336', fg='white', width=15, height=1,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#d32f2f', cursor="hand2")
        cancel_button.pack(side=tk.RIGHT, padx=10)
    
    def delete_selected_file(self, tree):
        """Delete selected file(s) from database"""
        selected = tree.selection()
        
        if not selected:
            messagebox.showinfo("Selection", "Please select file(s) to delete")
            return
            
        # Confirm deletion
        result = messagebox.askquestion("Delete Confirmation", 
                                     f"Are you sure you want to delete {len(selected)} file(s)?")
        if result != 'yes':
            return
            
        # Connect to database
        conn = self.connect_to_db()
        if not conn:
            return
            
        try:
            cursor = conn.cursor()
            
            # Delete each selected item
            for item in selected:
                values = tree.item(item, 'values')
                if values:
                    # Delete by ID
                    query = "DELETE FROM files WHERE id = %s"
                    cursor.execute(query, (values[0],))  # values[0] contains the ID
            
            conn.commit()
            
            messagebox.showinfo("Success", f"{len(selected)} file(s) deleted successfully.")
            
            # Refresh treeview
            self.load_data_from_db(tree, tree.master)
            
        except mysql.connector.Error as err:
            messagebox.showerror("Database Error", f"Failed to delete file(s): {err}")
        finally:
            if conn.is_connected():
                cursor.close()
                conn.close()
    
    def export_to_csv(self, tree):
        """Export treeview data to CSV file"""
        # Ask user for save location
        file_path = filedialog.asksaveasfilename(
            defaultextension='.csv',
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")],
            title="Save CSV File"
        )
        
        if not file_path:
            return  # User canceled
            
        try:
            with open(file_path, 'w', newline='') as csvfile:
                # Get column headers
                headers = tree['columns']
                
                # Write headers
                csvfile.write(','.join(headers) + '\n')
                
                # Write data rows
                for item in tree.get_children():
                    values = tree.item(item, 'values')
                    # Convert all values to strings
                    row = [str(val) for val in values]
                    csvfile.write(','.join(row) + '\n')
                    
            messagebox.showinfo("Export Successful", f"Data exported to {file_path}")
            
        except Exception as e:
            messagebox.showerror("Export Failed", f"Error exporting data: {e}")

if __name__ == "__main__":
    # Create the main window
    root = tk.Tk()
    app = ResponsiveApp(root)
    root.mainloop()