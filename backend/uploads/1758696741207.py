import csv

from email_notify_sample import *

from datetime import datetime



FILENAME = 'file_register.csv'

def initialize_register():
    try:
        with open(FILENAME, 'x', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['FileID', 'FileName', 'From', 'To', 'Date', 'Remarks'])
    except FileExistsError:
        pass

# def add_file(file_id, file_name, sender, receiver, remarks=''):
#     date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#     with open(FILENAME, 'a', newline='') as file:
#         writer = csv.writer(file)
#         writer.writerow([file_id, file_name, sender, receiver, date, remarks])
#     print("File added successfully.")
#     print('Sending email...')
#     send_email(file_name) 


def view_register():
    with open(FILENAME, 'r') as file:
        reader = csv.reader(file)
        for row in reader:
            print(row)

def main():
    initialize_register()
    while True:
        print("\n--- File Movement Register ---")
        print("1. Add File Movement")
        print("2. View Register")
        print("3. Exit")
        choice = input("Enter your choice: ")

        if choice == '1':
            file_id = input("Enter File ID: ")
            file_name = input("Enter File Name: ")
            sender = input("From (Sender): ")
            receiver = input("To (Receiver): ")
            remarks = input("Remarks (optional): ")
            add_file(file_id, file_name, sender, receiver, remarks)
        elif choice == '2':
            view_register()
        elif choice == '3':
            break
        else:
            print("Invalid choice. Try again.")

if __name__ == '__main__':
    main()

# root = tk.Tk()
# root.title("Random Password Generator")
# root.geometry("400x200")    