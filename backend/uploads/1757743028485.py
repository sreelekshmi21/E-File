import tkinter as tk
from datetime import datetime
from tkinter import messagebox
import mysql.connector 
from tkinter import ttk
import sys
from tkinter import Frame, filedialog, ttk, messagebox, font
import re
import os
import pymysql
from dotenv import load_dotenv

from tkcalendar import DateEntry
from datetime import date


load_dotenv()

class LeaveManagementApp:
    def __init__(self, root):
        self.root = root
       
        self.root.geometry("700x550")
        self.root.resizable(False, False)

        self.call_main_window()
        self.create_login_widgets() 
        self.test_db_connection()

    def call_main_window(self):

        self.root.title("Leave Management system")
        if sys.platform.startswith('win'):
             self.root.state('zoomed')
        elif sys.platform.startswith('linux'):    
             self.root.state('normal')  # For linux

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


    def create_login_widgets(self):

        title_label = tk.Label(self.root, text="LEAVE MANAGEMENT SYSTEM", 
                              font=self.title_font, bg='#e6f2ff', fg='#003366')
        title_label.grid(row=0, column=0, columnspan=3, pady=20)  
        self.input_frame = tk.Frame(self.root, bg='#e6f2ff', padx=20, pady=20,
                                  highlightbackground='#99ccff', highlightthickness=1)
        self.input_frame.grid(row=1, column=0, columnspan=3, sticky="nsew", padx=40, pady=30)
        self.input_frame.grid_columnconfigure(0, weight=1)
        self.input_frame.grid_columnconfigure(1, weight=2)
        self.input_frame.grid_columnconfigure(2, weight=3)

        # choices = ["employee","admin"]
        # row = 0
        content_frame = tk.Frame(bg='#e6f2ff', padx=20, pady=20,
                               highlightbackground='#99ccff', highlightthickness=1)
        content_frame.grid(row=1, column=0, sticky="nsew", padx=40, pady=10)
        content_frame.grid_columnconfigure(0, weight=1)
        content_frame.grid_columnconfigure(1, weight=1)
        # content_frame.grid_columnconfigure(0, weight=1)
        choices = ["employee","admin"]
        # content_frame.grid_columnconfigure(1, weight=1)
        row = 0
        file_id_label = tk.Label(content_frame, text="Username:", bg='#e6f2ff', 
                               font=self.label_font, anchor="e")
        file_id_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.id_entry = ttk.Entry(content_frame, width=40, font=self.label_font)
        self.id_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)
        
        # File Name
        row += 1
        name_label = tk.Label(content_frame, text="Password:", bg='#e6f2ff', 
                            font=self.label_font, anchor="e")
        name_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        self.name_entry = ttk.Entry(content_frame, width=40, font=self.label_font,show="*")
        self.name_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)
        
        # Sender
        # row += 1
        # logintype_label = tk.Label(content_frame, text="Login Type:", bg='#e6f2ff', 
        #                       font=self.label_font, anchor="e")
        # logintype_label.grid(row=row, column=0, sticky="e", padx=10, pady=10)
        # self.logintype_dropdown = ttk.Combobox(content_frame,values=choices)
        # self.logintype_dropdown.grid(row=row, column=1, sticky='w', padx=10, pady=10)
                
        # Create buttons frame
        button_frame = tk.Frame(self.root, bg='#e6f2ff', pady=20)
        button_frame.grid(row=2, column=0, columnspan=3, sticky="ew")
        button_frame.grid_columnconfigure(0, weight=1)
        button_frame.grid_columnconfigure(1, weight=1)
        
        # Submit button with improved styling
        self.submit_button = tk.Button(button_frame, text="LOGIN", command=self.login,
                              bg='#4CAF50', fg='white', width=20, height=2,
                              font=self.button_font, relief=tk.RAISED,
                              activebackground='#45a049', cursor="hand2")
        self.submit_button.grid(row=0, column=0, padx=20, pady=20)
        
        # View Register button with improved styling
        self.view_button = tk.Button(button_frame, text="SIGN UP", command=self.signup,
                             bg='#2196F3', fg='white', width=20, height=2,
                             font=self.button_font, relief=tk.RAISED,
                             activebackground='#0b7dda', cursor="hand2")
        self.view_button.grid(row=0, column=1, padx=20, pady=20)


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



    def login(self):
        print('login')
        username = self.id_entry.get()
        password = self.name_entry.get()
        # logintype = self.logintype_dropdown.get()
          # Validate inputs
        if not all([username, password]):
                messagebox.showerror("Invalid Input", "Please fill in all required fields.")
                return
        # if logintype == 'admin':
        #  print('LOgin admin')
        # elif logintype == 'employee': 
        #     print('LOgin employee')
        # if username=='admin' and password=='123':
        #  print('LOgin success')
        #  messagebox.showinfo("login", "LOGIN success")        
         
        #  self.open_treeview_window()
        # else:
        #     messagebox.showerror("Invalid Input", "Incorrect password/username.")      
        conn = self.connect_to_db()
        if not conn:
                return
                
        try:
                cursor = conn.cursor()
                # cursor.execute("SELECT * FROM signup WHERE passwd=123456")                
                query = "SELECT username,passwd FROM signup WHERE username = %s AND passwd = %s"
                cursor.execute(query,(username, password))
                result = cursor.fetchone()
                # cursor.execute()
                # conn.commit()
                if result:
                 messagebox.showinfo("login", "Login successfull")
                 self.root.withdraw()
                 self.open_leave_form_window()
                else: 
                   messagebox.showerror("login failed", "login failed")
        except mysql.connector.Error as err:
                print(f"Database error: {err}")
                messagebox.showerror("Database Error", f"Failed to login:\n{err}")
        finally:
                # if conn.is_connected():
                    cursor.close()
                    conn.close()


    def signup(self):
        print('sign up')
        new_signup_window = tk.Toplevel(self.root)
        new_signup_window.title("Sign Up Form")        
        # Make the new window fullscreen as well
        # new_signup_window.state('zoomed')
        if sys.platform.startswith('win'):
              new_signup_window.state('zoomed')
        elif sys.platform.startswith('linux'):    
              new_signup_window.state('normal')  # For linux

        new_signup_window.grid_columnconfigure(0, weight=1)
        new_signup_window.grid_rowconfigure(1, weight=1)  # Give the treeview area most of the space        
        new_signup_window.configure(bg='#e6f2ff')
        
        # Title frame
        title_frame = tk.Frame(new_signup_window, bg='#003366', pady=10)
        title_frame.grid(row=0, column=0, sticky="ew")
        
        title_label = tk.Label(title_frame, text="SIGN UP FORM", 
                             font=self.title_font, bg='#003366', fg='white')
        title_label.pack()


         # Create main frames
        input_frame_one = tk.Frame(new_signup_window, bg='#e6f2ff', padx=20, pady=20,
                                  highlightbackground='#99ccff', highlightthickness=1)
        input_frame_one.grid(row=1, column=0, columnspan=3, sticky="nsew", padx=40, pady=10)
        input_frame_one.grid_columnconfigure(0, weight=1)
        input_frame_one.grid_columnconfigure(1, weight=2)
        
        username_one = tk.Label(input_frame_one,text="Username", bg='#e6f2ff', font=self.label_font)
        username_one.pack(pady=(10,5))
         
       
        self.username_one_entry = ttk.Entry(input_frame_one, width=40, font=self.label_font)
        self.username_one_entry.pack(pady=(0,10))
        # username_entry.grid(row=row, column=1, sticky="w", padx=10, pady=10)

        password_one = tk.Label(input_frame_one,text="password", bg='#e6f2ff', font=self.label_font)
        password_one.pack(pady=(10, 5))
        self.password_one_entry = ttk.Entry(input_frame_one, width=40, font=self.label_font, show="*")
        self.password_one_entry.pack(pady=(0, 10))

        email_one = tk.Label(input_frame_one,text="email",bg='#e6f2ff', font=self.label_font)
        email_one.pack(pady=(10, 5))
        self.email_one_entry = ttk.Entry(input_frame_one, width=40, font=self.label_font)
        self.email_one_entry.pack(pady=(0, 10))

        department_one = tk.Label(input_frame_one,text="department",bg='#e6f2ff', font=self.label_font)
        department_one.pack(pady=(10, 5))
        self.department_one_entry = ttk.Entry(input_frame_one, width=40, font=self.label_font)
        self.department_one_entry.pack(pady=(0, 10))


        signup_button = tk.Button(input_frame_one, text="SIGN UP", command=self.register,
                             bg='#2196F3', fg='white', width=20, height=2,
                             font=self.button_font, relief=tk.RAISED,
                             activebackground='#0b7dda', cursor="hand2")
        signup_button.pack(pady=10)

        view_button = tk.Button(input_frame_one, text="BACK TO LOGIN", command=new_signup_window.destroy,
                             bg='#2196F3', fg='white', width=20, height=2,
                             font=self.button_font, relief=tk.RAISED,
                             activebackground='#0b7dda', cursor="hand2")
        view_button.pack(pady=10)



    def register(self):
        print('register')
        username = self.username_one_entry.get()
        print(username)
        password = self.password_one_entry.get()
        print(password)
        email = self.email_one_entry.get()
        print(email)
        department = self.department_one_entry.get()
        print(department)
       
        if not all([username, password,email,department]):
                messagebox.showerror("Invalid Input", "Please fill in all required fields.")
                return
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

        if not (re.match(email_pattern,email)):        
            print('invalif')   
            messagebox.showerror("Invalid email", "Invalid email.")
            return  

            # Connect to database
        conn = self.connect_to_db()
        if not conn:
                return
                
        try:
                cursor = conn.cursor()
                #check if username already exists
                query = "SELECT username FROM signup WHERE username = %s"
                cursor.execute(query,(username,))
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
                messagebox.showinfo("signup", "Signed up successfullly")
                
        except mysql.connector.Error as err:
                print(f"Database error: {err}")
                messagebox.showerror("Database Error", f"Failed to register user:\n{err}")
        finally:
                # if conn.is_connected():
                    cursor.close()
                    conn.close()   


    def connect_to_db(self):
        """Create and return a database connection"""
        MYSQL_HOST = os.getenv("MYSQL_HOST")
        MYSQL_USER = os.getenv("MYSQL_USER")
        MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
        MYSQL_DB = os.getenv("MYSQL_DB") 
        
        print(f"API Key: {MYSQL_HOST}")
        print(f"API Key: {MYSQL_USER}")
        print(f"API Key: {MYSQL_PASSWORD}")
        print(f"API Key: {MYSQL_DB}")
        try:
            conn = pymysql.connect(host = MYSQL_HOST,user = MYSQL_USER,password = MYSQL_PASSWORD,database = MYSQL_DB)
            return conn
        except pymysql.Error as err:
            messagebox.showerror("Database Connection Error", f"Failed to connect to database: {err}")
            return None
        
      
    def open_leave_form_window(self):
        print('Opening leave form')
        leave_form_window = tk.Toplevel(self.root)
        leave_form_window.title("Leave Application Form")

        # title_label = tk.Label(leave_form_window, text="Leave Application Form", font=("Arial", 16, "bold"),fg="darkblue",bg='lightyellow')
        # title_label.grid(row=0, column=0, columnspan=10, pady=10)
        title1 = tk.Label(leave_form_window,text="Santhigiri Foundation",font=("Arial", 14, "bold"),fg="darkgreen")
        title1.grid(row=0, column=0, columnspan=10, pady=(10, 0))

# Title 2
        title2 = tk.Label(leave_form_window,text="Leave Application Form",font=("Arial", 16, "bold"),fg="darkblue")
        title2.grid(row=1, column=0, columnspan=10, pady=(0, 10))
        # --- Top Section: 5-column, 1-row layout ---
         # --- Top Section: 5-column layout ---
        top_headers = ["Name", "Employee Code No", "Designation", "Department/Division/Unit", "Date of joining"]
        self.top_entries = {}

        for col, header in enumerate(top_headers):
            label = tk.Label(leave_form_window, text=header)
            label.grid(row=2, column=col, padx=5, pady=3)            
            # self.id_entry = ttk.Entry(leave_form_window, width=40, font=self.label_font)
            # self.id_entry.grid(row=2, column=col, sticky="w", padx=10, pady=10)            
            # entry = tk.Entry(leave_form_window, width=20)
            if header == "Date of joining":
             entry = DateEntry(leave_form_window, width=18, date_pattern='yyyy-mm-dd')
            else:
             entry = tk.Entry(leave_form_window, width=20)

            entry.grid(row=3, column=col, padx=5, pady=3)

            self.top_entries[header] = entry

        # --- Bottom Section ---
        bottom_start_row = 4

        # Header Map: label text and how many columns it spans
        header_map = [
            ("Date of Application", 1),
            ("Period of Leave", 2),
            ("Reason for Leave", 1),
            ("Type of Leave", 3),
            ("Signature of Employee", 1),
            ("Signature of Reporting Officer", 1),
            ("Signature of Dept/Division/Unit Head", 1)
        ]

        self.bottom_entries = {}
        col_index = 0

        # --- First Header Row ---
        for header, span in header_map:
            label = tk.Label(leave_form_window, text=header, wraplength=120, justify='center')
            label.grid(row=bottom_start_row, column=col_index, columnspan=span, padx=5, pady=2)
            col_index += span

        # --- Sub-Header Row ("From", "To", "Casual", "Medical", "Earned") ---
        col_index = 0
        for header, span in header_map:
            if header == "Period of Leave":
                tk.Label(leave_form_window, text="From").grid(row=bottom_start_row + 1, column=col_index, padx=2, pady=1)
                tk.Label(leave_form_window, text="To").grid(row=bottom_start_row + 1, column=col_index + 1, padx=2, pady=1)
                col_index += 2
            elif header == "Type of Leave":
                tk.Label(leave_form_window, text="Casual").grid(row=bottom_start_row + 1, column=col_index, padx=2, pady=1)
                tk.Label(leave_form_window, text="Medical").grid(row=bottom_start_row + 1, column=col_index + 1, padx=2, pady=1)
                tk.Label(leave_form_window, text="Earned").grid(row=bottom_start_row + 1, column=col_index + 2, padx=2, pady=1)
                col_index += 3
            else:
                # Empty label for alignment
                tk.Label(leave_form_window).grid(row=bottom_start_row + 1, column=col_index)
                col_index += 1

        # --- Entry Row ---
        col_index = 0
        for header, span in header_map:
            # if header == "Date of Application":
            #   entry = DateEntry(leave_form_window, width=18, date_pattern='yyyy-mm-dd', mindate=date.today())
            # # else:
            # #   entry = tk.Entry(leave_form_window, width=20)

            #   entry.grid(row=bottom_start_row + 2, column=col_index, padx=5, pady=2)
            #   self.bottom_entries[header] = entry
            #   col_index += 1
            if header == "Period of Leave":
                # from_entry = tk.Entry(leave_form_window, width=10)
                # from_entry.grid(row=bottom_start_row + 2, column=col_index, padx=2, pady=2)
                # self.bottom_entries["From"] = from_entry

                # to_entry = tk.Entry(leave_form_window, width=10)
                # to_entry.grid(row=bottom_start_row + 2, column=col_index + 1, padx=2, pady=2)
                # self.bottom_entries["To"] = to_entry
                from_entry = DateEntry(leave_form_window, width=10, date_pattern='yyyy-mm-dd', mindate=date.today())
                from_entry.grid(row=bottom_start_row + 2, column=col_index, padx=2, pady=2)
                self.bottom_entries["From"] = from_entry

                to_entry = DateEntry(leave_form_window, width=10, date_pattern='yyyy-mm-dd', mindate=date.today())
                to_entry.grid(row=bottom_start_row + 2, column=col_index + 1, padx=2, pady=2)
                self.bottom_entries["To"] = to_entry

                col_index += 2

            elif header == "Type of Leave":
                casual = tk.Entry(leave_form_window, width=6)
                casual.grid(row=bottom_start_row + 2, column=col_index, padx=2, pady=2)
                self.bottom_entries["Casual Leave"] = casual

                medical = tk.Entry(leave_form_window, width=6)
                medical.grid(row=bottom_start_row + 2, column=col_index + 1, padx=2, pady=2)
                self.bottom_entries["Medical Leave"] = medical

                earned = tk.Entry(leave_form_window, width=6)
                earned.grid(row=bottom_start_row + 2, column=col_index + 2, padx=2, pady=2)
                self.bottom_entries["Earned Leave"] = earned

                col_index += 3

            elif header == "Date of Application":
                entry = DateEntry(leave_form_window, width=18, date_pattern='yyyy-mm-dd', mindate=date.today())
                entry.grid(row=bottom_start_row + 2, column=col_index, padx=5, pady=2)
                self.bottom_entries[header] = entry
                col_index += 1   
            else:
                entry = tk.Entry(leave_form_window, width=20)
                entry.grid(row=bottom_start_row + 2, column=col_index, padx=5, pady=2)
                self.bottom_entries[header] = entry
                col_index += 1
    
            submit_btn = tk.Button(leave_form_window, text="Submit", command=self.submit_leave_form,bg="green", fg="white", font=("Arial", 10, "bold"),width=20, height=2, cursor="hand2")
            submit_btn.grid(row=bottom_start_row + 4, column=0, columnspan=10, pady=10)

            view_button = tk.Button(leave_form_window, text="VIEW REGISTER", 
                              command=lambda: self.open_treeview_window(),
                              bg='#2196F3', fg='white', width=20, height=2,
                              font=self.button_font, relief=tk.RAISED,
                              activebackground='#0b7dda', cursor="hand2")
            view_button.grid(row=bottom_start_row + 5, column=0, columnspan=10, pady=20)
    
    
    
    def get_all_form_values(self):
        form_data = {}

    # Top section values
        for field, entry in self.top_entries.items():
         form_data[field] = entry.get().strip()

    # Bottom section values
        for field, entry in self.bottom_entries.items():
         form_data[field] = entry.get().strip()

        return form_data


    def submit_leave_form(self):
        # print("Top Section:")
        # for field, entry in self.top_entries.items():
        #   value = entry.get()
        #   if not value:
        #     messagebox.showwarning("Missing Field", f"Please fill in the '{field}' field.")
        #     entry.focus_set()
        #     return
        #   print(f"  {field}: {value}")

        #   print("\nBottom Section:")
        # for field, entry in self.bottom_entries.items():
        #   value = entry.get()
        #   if not value and field not in ["Casual Leave", "Medical Leave", "Earned Leave","Signature of Reporting Officer","Signature of Dept/Division/Unit Head"]:  # Allow leave types to be optional
        #     messagebox.showwarning("Missing Field", f"Please fill in the '{field}' field.")
        #     entry.focus_set()
        #     return
        #   print(f"  {field}: {value}")     
        form_data = self.get_all_form_values()

           # Validate required fields
        for field, value in form_data.items():
          if field not in ["Casual Leave", "Medical Leave", "Earned Leave","Signature of Reporting Officer","Signature of Dept/Division/Unit Head"] and not value:
            messagebox.showwarning("Missing Field", f"Please fill in the '{field}' field.")
            return
        print(form_data)
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        conn = self.connect_to_db()
        if not conn:
                return   

        values = (
        form_data.get("Name"),
        form_data.get("Employee Code No"),
        form_data.get("Designation"),
        form_data.get("Department/Division/Unit"),
        form_data.get("Date of joining"),
        form_data.get("Date of Application"),
        form_data.get("From"),
        form_data.get("To"),
        form_data.get("Reason for Leave"),
        form_data.get("Casual Leave"),
        form_data.get("Medical Leave"),
        form_data.get("Earned Leave"),
        form_data.get("Signature of Employee"),
        form_data.get("Signature of Reporting Officer"),
        form_data.get("Signature of Dept/Division/Unit Head"),"Pending",date
    )        
        try:
            cursor = conn.cursor()
            print("Values:", values)
            print("Number of values:", len(values))
            cursor.execute('''
            INSERT INTO leave_applications (
                name, emp_code, designation, department, date_of_joining,
                date_of_application, leave_from, leave_to, reason,
                casual_leave, medical_leave, earned_leave,
                emp_signature, reporting_officer_signature, dept_head_signature,status,date_added
            ) VALUES (%s, %s, %s, %s, %s, %s, %s,%s,%s, %s,%s,%s, %s,%s,%s,%s,%s)
        ''', values)
            
            conn.commit()                    
            print("Leave added successfully to database.")  
            messagebox.showinfo("Success", "Leave added successfully to database.")
            self.open_treeview_window()

        except mysql.connector.Error as err:
                print(f"Database error: {err}")
                messagebox.showerror("Database Error", f"Failed to add file to database:\n{err}")     
       
        finally:
             
                cursor.close()
                conn.close()


    def open_treeview_window(self, parent_window=None):
        """Open a new window with treeview to display database data"""
        treeview_window = tk.Toplevel(self.root)
        treeview_window.title("File Register Data")
        
        # Make the new window fullscreen as well
        # treeview_window.state('zoomed')
        if sys.platform.startswith('win'):
              treeview_window.state('zoomed')
        elif sys.platform.startswith('linux'):    
              treeview_window.state('normal')  # For linux

        
        # Configure the grid
        treeview_window.grid_columnconfigure(0, weight=1)
        treeview_window.grid_rowconfigure(1, weight=1)  # Give the treeview area most of the space
        
        treeview_window.configure(bg='#e6f2ff')
        
        # Title frame
        title_frame = tk.Frame(treeview_window, bg='#003366', pady=10)
        title_frame.grid(row=0, column=0, sticky="ew")
        
        title_label = tk.Label(title_frame, text="Leave Register", 
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
            # Selection indicator frame
        selection_frame = tk.Frame(content_frame, bg='#e6f2ff', pady=5)
        selection_frame.grid(row=2, column=0, sticky="ew")
        
        selection_label = tk.Label(selection_frame, text="Selected: 0 records", bg='#e6f2ff', font=self.label_font)
        selection_label.pack(side=tk.LEFT, padx=10)
        
        # Update the selection counter when selection changes
        def on_tree_select(event):
            selected_items = len(tree.selection())
            selection_label.config(text=f"Selected: {selected_items} records")
        
        tree.bind('<<TreeviewSelect>>', on_tree_select)
        
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
       

        status_frame = tk.Frame(treeview_window, bg='#003366', height=30)
        status_frame.grid(row=2, column=0, sticky="ew")
        
        status_label = tk.Label(status_frame, text="Ready", bg='#003366', fg='white', anchor="w", padx=10)
        status_label.pack(side=tk.LEFT, fill=tk.X)
     

       # Define columns
        tree['columns'] = ('id', 'name', 'emp_code', 'designation', 'department', 'date_of_joining', 'date_of_application','leave_from','leave_to','reason','casual_leave',"status",'date_added')
        
        # Format columns
        tree.column('#0', width=0, stretch=tk.NO)  # Hidden column
        tree.column('id', width=50, anchor=tk.CENTER)
        tree.column('name', width=100, anchor=tk.W)
        tree.column('emp_code', width=150, anchor=tk.W)
        tree.column('designation', width=150, anchor=tk.W)
        tree.column('department', width=150, anchor=tk.W)
        # tree.column('despatched_to', width=150, anchor=tk.W)
        tree.column('date_of_joining', width=150, anchor=tk.W)
        tree.column('date_of_application', width=200, anchor=tk.W)
        tree.column('leave_from', width=200, anchor=tk.W)
        tree.column('leave_to', width=200, anchor=tk.W)
        tree.column('reason', width=200, anchor=tk.W)
        tree.column('casual_leave', width=200, anchor=tk.W)
        tree.column('status', width=200, anchor=tk.W)
        tree.column('date_added', width=150, anchor=tk.W)
        
        # Create headings
        tree.heading('#0', text='', anchor=tk.CENTER)
        tree.heading('id', text='ID', anchor=tk.CENTER)
        tree.heading('name', text='Employee Name', anchor=tk.CENTER)
        tree.heading('emp_code', text='Employee Code', anchor=tk.CENTER)
        tree.heading('designation', text='Designation', anchor=tk.CENTER)
        tree.heading('department', text='Department', anchor=tk.CENTER)
        # tree.heading('despatched_to', text='Despatched To', anchor=tk.CENTER)
        tree.heading('date_of_joining', text='Date of joining', anchor=tk.CENTER)
        tree.heading('date_of_application', text='Date of Application', anchor=tk.CENTER)
        tree.heading('leave_from', text='Leave From', anchor=tk.CENTER)
        tree.heading('leave_to', text='Leave To', anchor=tk.CENTER)
        tree.heading('reason', text='Reason', anchor=tk.CENTER)
        tree.heading('casual_leave', text='Type', anchor=tk.CENTER)
        tree.heading('status', text='Status', anchor=tk.CENTER)
        tree.heading('date_added', text='Date', anchor=tk.CENTER)
        
        self.load_data_from_db(tree, status_label)

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
        buttons_frame = tk.Frame(content_frame, bg='#e6f2ff', pady=10)
        buttons_frame.grid(row=6, column=0, sticky="ew")
        buttons_frame.grid_columnconfigure(0, weight=1)
        buttons_frame.grid_columnconfigure(1, weight=1)
        buttons_frame.grid_columnconfigure(2, weight=1) 
        buttons_frame.grid_columnconfigure(3, weight=1) 
        buttons_frame.grid_columnconfigure(4, weight=1) 
        buttons_frame.grid_columnconfigure(5, weight=1) 
        edit_button = tk.Button(buttons_frame, text="EDIT", command=lambda: self.edit_selected_leave(tree),
                              bg='#FFA500', fg='white', width=15, height=1,
                              font=self.button_font, relief=tk.RAISED,
                              activebackground='#FF8C00', cursor="hand2")
        edit_button.grid(row=0, column=0, padx=10, pady=10)
        
        # Delete button
        delete_button = tk.Button(buttons_frame, text="DELETE", command=lambda: self.delete_selected_leave(tree),
                                bg='#f44336', fg='white', width=15, height=1,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#d32f2f', cursor="hand2")
        delete_button.grid(row=0, column=1, padx=10, pady=10)


        back_button = tk.Button(buttons_frame, text="back", 
                                # command=self.back_to_loginwindow,
                                command=treeview_window.destroy,
                                bg='#2196F3', fg='white', width=15, height=1,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#0b7dda', cursor="hand2")
        back_button.grid(row=0, column=2, padx=10, pady=10)   


        approve_button = tk.Button(buttons_frame, text="Approve", 
                                command=lambda: self.update_status("Approved",tree),
                                # command=treeview_window.destroy,
                                bg='#2196F3', fg='white', width=15, height=1,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#0b7dda', cursor="hand2")
        approve_button.grid(row=0, column=3, padx=10, pady=10)   


        reject_button = tk.Button(buttons_frame, text="Reject", 
                                command=lambda: self.update_status("Rejected",tree),
                                # command=treeview_window.destroy,
                                bg='#2196F3', fg='white', width=15, height=1,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground="#da950b", cursor="hand2")
        reject_button.grid(row=0, column=4, padx=10, pady=10)


        logout_button = tk.Button(buttons_frame, text="LOGOUT", 
                              command=lambda: self.logout_and_close_window(),
                              bg='#f44336', fg='white', width=20, height=2,
                              font=self.button_font, relief=tk.RAISED,
                              activebackground='#0b7dda', cursor="hand2")
        logout_button.grid(row=0, column=5, padx=20, pady=20)
   
    
    def logout_and_close_window(self):
         result = messagebox.askquestion("Logout", "Are you sure you want to logout?")
         if result == 'yes':
        #  window.destroy()
           self.root.deiconify()
        

    def edit_selected_leave(self, tree):
        """Edit the selected file"""
        selected = tree.selection()        
        if not selected:
            messagebox.showinfo("Selection", "Please select a leave request to edit")
            return
            
        # For simplicity, only edit the last selected item if multiple are selected
        item = selected[0]
        values = tree.item(item, 'values')
        
        if not values:
            return
            
        #Create edit dialog
        edit_window = tk.Toplevel(self.root)
        edit_window.title("Edit Leave Information")
        edit_window.geometry("500x500")
        edit_window.configure(bg='#e6f2ff')
        
        # Create form
        form_frame = tk.Frame(edit_window, bg='#e6f2ff', padx=20, pady=20)
        form_frame.pack(fill=tk.BOTH, expand=True)
        
        # File ID
        tk.Label(form_frame, text="Employee Name:", bg='#e6f2ff', font=self.label_font).grid(row=0, column=0, sticky="e", padx=10, pady=5)
        edit_name = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_name.grid(row=0, column=1, sticky="w", padx=10, pady=5)
        edit_name.insert(0, values[1])  # Index 1 contains file_id
        
        # File Name
        tk.Label(form_frame, text="Employee Code:", bg='#e6f2ff', font=self.label_font).grid(row=1, column=0, sticky="e", padx=10, pady=5)
        edit_code = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_code.grid(row=1, column=1, sticky="w", padx=10, pady=5)
        edit_code.insert(0, values[2])  # Index 2 contains file_name
        
        # Sender
        tk.Label(form_frame, text="Designation:", bg='#e6f2ff', font=self.label_font).grid(row=2, column=0, sticky="e", padx=10, pady=5)
        edit_designation = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_designation.grid(row=2, column=1, sticky="w", padx=10, pady=5)
        edit_designation.insert(0, values[3])  # Index 3 contains sender
        
        # Receiver
        tk.Label(form_frame, text="Department:", bg='#e6f2ff', font=self.label_font).grid(row=3, column=0, sticky="e", padx=10, pady=5)
        edit_department = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_department.grid(row=3, column=1, sticky="w", padx=10, pady=5)
        edit_department.insert(0, values[4])  # Index 4 contains receiver
        
        # Despatched To
        # tk.Label(form_frame, text="Despatched To:", bg='#e6f2ff', font=self.label_font).grid(row=4, column=0, sticky="e", padx=10, pady=5)
        # edit_despatch = ttk.Entry(form_frame, width=30, font=self.label_font)
        # edit_despatch.grid(row=4, column=1, sticky="w", padx=10, pady=5)
        # edit_despatch.insert(0, values[5])  # Index 5 contains despatched_to
        
        # Remarks
        #  from_entry = DateEntry(leave_form_window, width=10, date_pattern='yyyy-mm-dd')
        #         from_entry.grid(row=bottom_start_row + 2, column=col_index, padx=2, pady=2)
        #         self.bottom_entries["From"] = from_entry 
        tk.Label(form_frame, text="Date of joining:", bg='#e6f2ff', font=self.label_font).grid(row=4, column=0, sticky="e", padx=10, pady=5)
        edit_date_of_joining = DateEntry(form_frame, width=10, date_pattern='yyyy-mm-dd')
        edit_date_of_joining.grid(row=4, column=1, sticky="w", padx=10, pady=5)
        edit_date_of_joining.insert(0, values[5])  # Index 6 contains remarks

         # InwardNum
        tk.Label(form_frame, text="Date of Application:", bg='#e6f2ff', font=self.label_font).grid(row=5, column=0, sticky="e", padx=10, pady=5)
        edit_date_of_application = DateEntry(form_frame, width=10, date_pattern='yyyy-mm-dd')
        edit_date_of_application.grid(row=5, column=1, sticky="w", padx=10, pady=5)
        edit_date_of_application.insert(0, values[6])  # Index 7 contains inwardnum
        
         # OutwardNum
        tk.Label(form_frame, text="Leave From:", bg='#e6f2ff', font=self.label_font).grid(row=6, column=0, sticky="e", padx=10, pady=5)
        edit_leave_from = DateEntry(form_frame, width=10, date_pattern='yyyy-mm-dd')
        edit_leave_from.grid(row=6, column=1, sticky="w", padx=10, pady=5)
        edit_leave_from.insert(0, values[7])  # Index 8 contains outwardnum 

        tk.Label(form_frame, text="Leave To:", bg='#e6f2ff', font=self.label_font).grid(row=7, column=0, sticky="e", padx=10, pady=5)
        edit_leave_to = DateEntry(form_frame, width=10, date_pattern='yyyy-mm-dd')
        edit_leave_to.grid(row=7, column=1, sticky="w", padx=10, pady=5)
        edit_leave_to.insert(0, values[8])  # Index 8 contains outwardnum


        tk.Label(form_frame, text="Reason:", bg='#e6f2ff', font=self.label_font).grid(row=8, column=0, sticky="e", padx=10, pady=5)
        edit_reason = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_reason.grid(row=8, column=1, sticky="w", padx=10, pady=5)
        edit_reason.insert(0, values[9])  # Index 8 contains outwardnum 


        tk.Label(form_frame, text="Type:", bg='#e6f2ff', font=self.label_font).grid(row=9, column=0, sticky="e", padx=10, pady=5)
        edit_type = ttk.Entry(form_frame, width=30, font=self.label_font)
        edit_type.grid(row=9, column=1, sticky="w", padx=10, pady=5)
        edit_type.insert(0, values[10])  # Index 8 contains outwardnum


        def update_leave():
            # Get updated values
            name = edit_name.get()
            code =edit_code.get()
            designation = edit_designation.get()
            department = edit_department.get()
            date_of_joining =edit_date_of_joining.get()
            date_of_application = edit_date_of_application.get()
            leave_from = edit_leave_from.get()
            leave_to = edit_leave_to.get()
            reason = edit_reason.get()
            type=edit_type.get()

            selected_items = tree.selection()
            id = tree.item(selected_items[0])["values"][0]

            # Validate
            if not all([code, name, designation, department, date_of_joining,date_of_application,leave_from,leave_to,reason,type]):
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
                UPDATE leave_applications 
                SET name = %s, emp_code = %s, designation = %s, department = %s, 
                    date_of_joining=%s, date_of_application = %s,leave_from = %s,leave_to = %s,reason = %s,casual_leave = %s,date_added=%s
                WHERE id = %s
                """
                values = (name, code, designation,  department, date_of_joining,date_of_application,leave_from,leave_to,reason,type, date, id)  # values[0] contains the ID
                
                cursor.execute(query, values)
                conn.commit()                
                messagebox.showinfo("Success", "Leave Request updated successfully.")                
                # Refresh the treeview
                edit_window.destroy()
                # self.refresh_data()
                self.load_data_from_db(tree,edit_window)
                
                # Close the edit window
                # edit_window.destroy()
                
            except mysql.connector.Error as err:
                messagebox.showerror("Database Error", f"Failed to update file: {err}")
            finally:
                # if conn.is_connected():
                    cursor.close()
                    conn.close()


        buttons_frame = tk.Frame(edit_window, bg='#e6f2ff', pady=10)
        buttons_frame.pack(fill=tk.X)
        
        update_button = tk.Button(buttons_frame, text="UPDATE",
                                  command=update_leave,
                                bg='#4CAF50', fg='white', width=15, height=1,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#45a049', cursor="hand2")
        update_button.pack(side=tk.LEFT, padx=10)
        
        cancel_button = tk.Button(buttons_frame, text="CANCEL", command=edit_window.destroy,
                                bg='#f44336', fg='white', width=15, height=1,
                                font=self.button_font, relief=tk.RAISED,
                                activebackground='#d32f2f', cursor="hand2")
        cancel_button.pack(side=tk.RIGHT, padx=10)
               

          
    def delete_selected_leave(self, tree):
         """Delete selected file(s) from database"""
         selected = tree.selection()        
         if not selected:
            messagebox.showinfo("Selection", "Please select leave(s) to delete")
            return
            
        # Confirm deletion
         result = messagebox.askquestion("Delete Confirmation", 
                                     f"Are you sure you want to delete {len(selected)} leave(s)?")
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
                    query = "DELETE FROM leave_applications WHERE id = %s"
                    cursor.execute(query, (values[0],))  # values[0] contains the ID
            
            conn.commit()            
            messagebox.showinfo("Success", f"{len(selected)} leave(s) deleted successfully.")
            
            # Refresh treeview
            self.load_data_from_db(tree, tree.master)
            
         except mysql.connector.Error as err:
            messagebox.showerror("Database Error", f"Failed to delete leave(s): {err}")
         finally:
            # if conn.is_connected():
                cursor.close()
                conn.close()



    def update_status(self, new_status, tree):
        print('New status',new_status)
        selected = tree.selection()
        if not selected:
            messagebox.showwarning("No Selection", "Please select a request.")
            return

        conn = self.connect_to_db()
        if not conn:
                return
        try:
            cursor = conn.cursor()
            for item in selected:
             values = tree.item(item, 'values')
             leave_id = values[0]
             cursor.execute("UPDATE leave_applications SET status = %s WHERE id = %s", (new_status, leave_id))
            conn.commit() 
            messagebox.showinfo("Success", "Leave request updated successfully.")

            self.refresh_data()
    # def approve_leave(self):
    #     # self.update_status("Approved")
    #     print('approve elave')
    #     self.update_status("Approved")
        except mysql.connector.Error as err:
                messagebox.showerror("Database Error", f"Failed to update leave: {err}")
        finally:
                # if conn.is_connected():
                    cursor.close()
                    conn.close()


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
            query = "SELECT id, name, emp_code, designation, department, date_of_joining, date_of_application, leave_from, leave_to, reason, casual_leave, status, date_added FROM leave_applications ORDER BY date_added DESC"
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
            # if conn.is_connected():
                cursor.close()
                conn.close()



if __name__ == "__main__":
    root = tk.Tk()
    app = LeaveManagementApp(root)
    root.mainloop()
    
#     #   root = tk.Tk()
#     #   root.title("4x2 Grid Layout with Labels and Text Fields")

# # Define labels for each field
# labels = [
#     ["First Name", "Last Name", "Email", "Phone"],
#     ["Address", "City", "State", "Zip Code"]
# ]

# if __name__ == "__main__":
#     root = tk.Tk()
#     app = LeaveManagementApp(root)
#     root.mainloop()

# # Loop to create labels and text entry fields
# for row in range(2):
#     for col in range(4):
#         label_text = labels[row][col]
        
#         # Create and place label
#         label = tk.Label(root, text=label_text)
#         label.grid(row=row*2, column=col, padx=5, pady=2)
        
#         # Create and place entry box below label
#         entry = tk.Entry(root, width=20)
#         entry.grid(row=row*2 + 1, column=col, padx=5, pady=2)

# # Run the Tkinter event loop
# # root.mainloop()

# if __name__ == "__main__":
#     root = tk.Tk()
#     app = LeaveManagementApp(root)
#     root.mainloop()



        # Add headers
    

      
    #   if sys.platform.startswith('win'):
    #           leave_form_window.state('zoomed')
    #   elif sys.platform.startswith('linux'):    
    #           leave_form_window.state('normal')  # For linux
    



    
    
    # return root
    #   calc= tk.frame(root,bg = 'red')
    #   hist  = tk.frame(root,bg = 'green')

    #   root.grid_columnconfigure(0,weight = 1)
    #   root.grid_columnconfigure(1,weight = 1)
    #   root.grid_rowconfigure(0,weight = 1)
    #   calc.grid(row = 0,column=0,sticky = 'nsew')
    #   hist.grid(row=0,column=1,sticky = 'nsew')
    #   for row in range(self.rows):
    #         row_entries = []
    #         for col in range(self.columns):
    #             label_text = self.get_label_text(row, col)
    #             # Label to the left of each Entry
    #             label = tk.Label(leave_form_window, text=label_text, font=("Arial", 9))
    #             label.grid(row=row, column=col*2, padx=2, pady=4, sticky="e")

    #             entry = tk.Entry(leave_form_window, width=15)
    #             entry.grid(row=row, column=col*2 + 1, padx=2, pady=4)
    #             row_entries.append(entry)
    #         self.entries.append(row_entries)

        
    

    # def get_label_text(self, row, col):
    #         # Custom label text for specific cells
    #         if row == 0 and col == 0:
    #             return "Name of Employee"
    #         elif row == 0 and col == 1:
    #             return "Employee Code No"
    #         elif row == 0 and col == 2:
    #             return "Designation"
    #         elif row == 0 and col == 3:
    #             return "Department/Division/Unit"
    #         elif row == 0 and col == 4:
    #             return "Date of joining"
    #         else:
    #           return f"R{row+1}C{col+1}"  # Default pattern

    

# if __name__ == "__main__":
#     root = tk.Tk()
#     app = LeaveManagementApp(root)
#     root.mainloop()









