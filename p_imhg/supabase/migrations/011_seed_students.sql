-- ============================================================
-- SEED: DUMMY STUDENTS (20-23 per branch × 6 branches × 3 years)
-- Students are inserted into public.users with role_id=5
-- NOTE: These students do NOT have auth.users entries
--       They are data-only records for testing result uploads
-- ============================================================

-- Helper: generate phone numbers deterministically
-- Format: 98XXXXXXXX

-- ============================================================
-- COMPUTER ENGINEERING (22 students per year = 66 total)
-- ============================================================
INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active) VALUES
-- Year 1
(uuid_generate_v4(), 5, 'Aarav Sharma', 'student.ce001@college.edu', 'CE001', 'Computer Engineering', 1, '2025-26', 'N22', '9800000101', true),
(uuid_generate_v4(), 5, 'Vivaan Gupta', 'student.ce002@college.edu', 'CE002', 'Computer Engineering', 1, '2025-26', 'N22', '9800000102', true),
(uuid_generate_v4(), 5, 'Aditya Verma', 'student.ce003@college.edu', 'CE003', 'Computer Engineering', 1, '2025-26', 'N22', '9800000103', true),
(uuid_generate_v4(), 5, 'Sai Patel', 'student.ce004@college.edu', 'CE004', 'Computer Engineering', 1, '2025-26', 'N22', '9800000104', true),
(uuid_generate_v4(), 5, 'Arjun Singh', 'student.ce005@college.edu', 'CE005', 'Computer Engineering', 1, '2025-26', 'N22', '9800000105', true),
(uuid_generate_v4(), 5, 'Reyansh Kumar', 'student.ce006@college.edu', 'CE006', 'Computer Engineering', 1, '2025-26', 'N22', '9800000106', true),
(uuid_generate_v4(), 5, 'Ayaan Thakur', 'student.ce007@college.edu', 'CE007', 'Computer Engineering', 1, '2025-26', 'N22', '9800000107', true),
(uuid_generate_v4(), 5, 'Ishaan Rana', 'student.ce008@college.edu', 'CE008', 'Computer Engineering', 1, '2025-26', 'N22', '9800000108', true),
(uuid_generate_v4(), 5, 'Dhruv Chauhan', 'student.ce009@college.edu', 'CE009', 'Computer Engineering', 1, '2025-26', 'N22', '9800000109', true),
(uuid_generate_v4(), 5, 'Kabir Joshi', 'student.ce010@college.edu', 'CE010', 'Computer Engineering', 1, '2025-26', 'N22', '9800000110', true),
(uuid_generate_v4(), 5, 'Ananya Mehta', 'student.ce011@college.edu', 'CE011', 'Computer Engineering', 1, '2025-26', 'N22', '9800000111', true),
(uuid_generate_v4(), 5, 'Diya Kapoor', 'student.ce012@college.edu', 'CE012', 'Computer Engineering', 1, '2025-26', 'N22', '9800000112', true),
(uuid_generate_v4(), 5, 'Priya Negi', 'student.ce013@college.edu', 'CE013', 'Computer Engineering', 1, '2025-26', 'N22', '9800000113', true),
(uuid_generate_v4(), 5, 'Sara Thakur', 'student.ce014@college.edu', 'CE014', 'Computer Engineering', 1, '2025-26', 'N22', '9800000114', true),
(uuid_generate_v4(), 5, 'Riya Sharma', 'student.ce015@college.edu', 'CE015', 'Computer Engineering', 1, '2025-26', 'N22', '9800000115', true),
(uuid_generate_v4(), 5, 'Kunal Pathania', 'student.ce016@college.edu', 'CE016', 'Computer Engineering', 1, '2025-26', 'N22', '9800000116', true),
(uuid_generate_v4(), 5, 'Manish Dogra', 'student.ce017@college.edu', 'CE017', 'Computer Engineering', 1, '2025-26', 'N22', '9800000117', true),
(uuid_generate_v4(), 5, 'Rohit Bhardwaj', 'student.ce018@college.edu', 'CE018', 'Computer Engineering', 1, '2025-26', 'N22', '9800000118', true),
(uuid_generate_v4(), 5, 'Nikhil Sen', 'student.ce019@college.edu', 'CE019', 'Computer Engineering', 1, '2025-26', 'N22', '9800000119', true),
(uuid_generate_v4(), 5, 'Vikram Pandit', 'student.ce020@college.edu', 'CE020', 'Computer Engineering', 1, '2025-26', 'N22', '9800000120', true),
(uuid_generate_v4(), 5, 'Pooja Yadav', 'student.ce021@college.edu', 'CE021', 'Computer Engineering', 1, '2025-26', 'N22', '9800000121', true),
(uuid_generate_v4(), 5, 'Sneha Chauhan', 'student.ce022@college.edu', 'CE022', 'Computer Engineering', 1, '2025-26', 'N22', '9800000122', true),
-- Year 2
(uuid_generate_v4(), 5, 'Rahul Thakur', 'student.ce023@college.edu', 'CE023', 'Computer Engineering', 2, '2024-25', 'N22', '9800000201', true),
(uuid_generate_v4(), 5, 'Amit Chauhan', 'student.ce024@college.edu', 'CE024', 'Computer Engineering', 2, '2024-25', 'N22', '9800000202', true),
(uuid_generate_v4(), 5, 'Deepak Verma', 'student.ce025@college.edu', 'CE025', 'Computer Engineering', 2, '2024-25', 'N22', '9800000203', true),
(uuid_generate_v4(), 5, 'Sunil Rana', 'student.ce026@college.edu', 'CE026', 'Computer Engineering', 2, '2024-25', 'N22', '9800000204', true),
(uuid_generate_v4(), 5, 'Neha Sharma', 'student.ce027@college.edu', 'CE027', 'Computer Engineering', 2, '2024-25', 'N22', '9800000205', true),
(uuid_generate_v4(), 5, 'Preeti Gupta', 'student.ce028@college.edu', 'CE028', 'Computer Engineering', 2, '2024-25', 'N22', '9800000206', true),
(uuid_generate_v4(), 5, 'Tarun Singh', 'student.ce029@college.edu', 'CE029', 'Computer Engineering', 2, '2024-25', 'N22', '9800000207', true),
(uuid_generate_v4(), 5, 'Gaurav Mehta', 'student.ce030@college.edu', 'CE030', 'Computer Engineering', 2, '2024-25', 'N22', '9800000208', true),
(uuid_generate_v4(), 5, 'Ankit Patel', 'student.ce031@college.edu', 'CE031', 'Computer Engineering', 2, '2024-25', 'N22', '9800000209', true),
(uuid_generate_v4(), 5, 'Prashant Joshi', 'student.ce032@college.edu', 'CE032', 'Computer Engineering', 2, '2024-25', 'N22', '9800000210', true),
(uuid_generate_v4(), 5, 'Ritika Pathania', 'student.ce033@college.edu', 'CE033', 'Computer Engineering', 2, '2024-25', 'N22', '9800000211', true),
(uuid_generate_v4(), 5, 'Kavita Negi', 'student.ce034@college.edu', 'CE034', 'Computer Engineering', 2, '2024-25', 'N22', '9800000212', true),
(uuid_generate_v4(), 5, 'Harsh Dogra', 'student.ce035@college.edu', 'CE035', 'Computer Engineering', 2, '2024-25', 'N22', '9800000213', true),
(uuid_generate_v4(), 5, 'Vikas Kumar', 'student.ce036@college.edu', 'CE036', 'Computer Engineering', 2, '2024-25', 'N22', '9800000214', true),
(uuid_generate_v4(), 5, 'Meena Yadav', 'student.ce037@college.edu', 'CE037', 'Computer Engineering', 2, '2024-25', 'N22', '9800000215', true),
(uuid_generate_v4(), 5, 'Sanjay Bhatt', 'student.ce038@college.edu', 'CE038', 'Computer Engineering', 2, '2024-25', 'N22', '9800000216', true),
(uuid_generate_v4(), 5, 'Pawan Thakur', 'student.ce039@college.edu', 'CE039', 'Computer Engineering', 2, '2024-25', 'N22', '9800000217', true),
(uuid_generate_v4(), 5, 'Nisha Sen', 'student.ce040@college.edu', 'CE040', 'Computer Engineering', 2, '2024-25', 'N22', '9800000218', true),
(uuid_generate_v4(), 5, 'Ravi Pandit', 'student.ce041@college.edu', 'CE041', 'Computer Engineering', 2, '2024-25', 'N22', '9800000219', true),
(uuid_generate_v4(), 5, 'Simran Kapoor', 'student.ce042@college.edu', 'CE042', 'Computer Engineering', 2, '2024-25', 'N22', '9800000220', true),
(uuid_generate_v4(), 5, 'Ajay Chand', 'student.ce043@college.edu', 'CE043', 'Computer Engineering', 2, '2024-25', 'N22', '9800000221', true),
-- Year 3
(uuid_generate_v4(), 5, 'Mohit Sharma', 'student.ce044@college.edu', 'CE044', 'Computer Engineering', 3, '2023-24', 'N22', '9800000301', true),
(uuid_generate_v4(), 5, 'Anjali Verma', 'student.ce045@college.edu', 'CE045', 'Computer Engineering', 3, '2023-24', 'N22', '9800000302', true),
(uuid_generate_v4(), 5, 'Rajesh Kumar', 'student.ce046@college.edu', 'CE046', 'Computer Engineering', 3, '2023-24', 'N22', '9800000303', true),
(uuid_generate_v4(), 5, 'Sunita Devi', 'student.ce047@college.edu', 'CE047', 'Computer Engineering', 3, '2023-24', 'N22', '9800000304', true),
(uuid_generate_v4(), 5, 'Lokesh Rana', 'student.ce048@college.edu', 'CE048', 'Computer Engineering', 3, '2023-24', 'N22', '9800000305', true),
(uuid_generate_v4(), 5, 'Komal Thakur', 'student.ce049@college.edu', 'CE049', 'Computer Engineering', 3, '2023-24', 'N22', '9800000306', true),
(uuid_generate_v4(), 5, 'Naveen Gupta', 'student.ce050@college.edu', 'CE050', 'Computer Engineering', 3, '2023-24', 'N22', '9800000307', true),
(uuid_generate_v4(), 5, 'Rekha Patel', 'student.ce051@college.edu', 'CE051', 'Computer Engineering', 3, '2023-24', 'N22', '9800000308', true),
(uuid_generate_v4(), 5, 'Sumit Singh', 'student.ce052@college.edu', 'CE052', 'Computer Engineering', 3, '2023-24', 'N22', '9800000309', true),
(uuid_generate_v4(), 5, 'Geeta Chauhan', 'student.ce053@college.edu', 'CE053', 'Computer Engineering', 3, '2023-24', 'N22', '9800000310', true),
(uuid_generate_v4(), 5, 'Ashok Mehta', 'student.ce054@college.edu', 'CE054', 'Computer Engineering', 3, '2023-24', 'N22', '9800000311', true),
(uuid_generate_v4(), 5, 'Pooja Bhardwaj', 'student.ce055@college.edu', 'CE055', 'Computer Engineering', 3, '2023-24', 'N22', '9800000312', true),
(uuid_generate_v4(), 5, 'Vivek Negi', 'student.ce056@college.edu', 'CE056', 'Computer Engineering', 3, '2023-24', 'N22', '9800000313', true),
(uuid_generate_v4(), 5, 'Sakshi Dogra', 'student.ce057@college.edu', 'CE057', 'Computer Engineering', 3, '2023-24', 'N22', '9800000314', true),
(uuid_generate_v4(), 5, 'Tushar Joshi', 'student.ce058@college.edu', 'CE058', 'Computer Engineering', 3, '2023-24', 'N22', '9800000315', true),
(uuid_generate_v4(), 5, 'Divya Pathania', 'student.ce059@college.edu', 'CE059', 'Computer Engineering', 3, '2023-24', 'N22', '9800000316', true),
(uuid_generate_v4(), 5, 'Manoj Pandit', 'student.ce060@college.edu', 'CE060', 'Computer Engineering', 3, '2023-24', 'N22', '9800000317', true),
(uuid_generate_v4(), 5, 'Kiran Yadav', 'student.ce061@college.edu', 'CE061', 'Computer Engineering', 3, '2023-24', 'N22', '9800000318', true),
(uuid_generate_v4(), 5, 'Deepa Chand', 'student.ce062@college.edu', 'CE062', 'Computer Engineering', 3, '2023-24', 'N22', '9800000319', true),
(uuid_generate_v4(), 5, 'Saurabh Kapoor', 'student.ce063@college.edu', 'CE063', 'Computer Engineering', 3, '2023-24', 'N22', '9800000320', true),
(uuid_generate_v4(), 5, 'Megha Sen', 'student.ce064@college.edu', 'CE064', 'Computer Engineering', 3, '2023-24', 'N22', '9800000321', true),
(uuid_generate_v4(), 5, 'Arun Bhatt', 'student.ce065@college.edu', 'CE065', 'Computer Engineering', 3, '2023-24', 'N22', '9800000322', true)
ON CONFLICT (department, year, roll_no) DO NOTHING;

-- ============================================================
-- CIVIL ENGINEERING (21 students per year = 63 total)
-- ============================================================
INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active) VALUES
(uuid_generate_v4(), 5, 'Rakesh Thakur', 'student.cv001@college.edu', 'CV001', 'Civil Engineering', 1, '2025-26', 'N22', '9801000101', true),
(uuid_generate_v4(), 5, 'Suman Devi', 'student.cv002@college.edu', 'CV002', 'Civil Engineering', 1, '2025-26', 'N22', '9801000102', true),
(uuid_generate_v4(), 5, 'Bharat Singh', 'student.cv003@college.edu', 'CV003', 'Civil Engineering', 1, '2025-26', 'N22', '9801000103', true),
(uuid_generate_v4(), 5, 'Kamla Rana', 'student.cv004@college.edu', 'CV004', 'Civil Engineering', 1, '2025-26', 'N22', '9801000104', true),
(uuid_generate_v4(), 5, 'Om Prakash', 'student.cv005@college.edu', 'CV005', 'Civil Engineering', 1, '2025-26', 'N22', '9801000105', true),
(uuid_generate_v4(), 5, 'Seema Chauhan', 'student.cv006@college.edu', 'CV006', 'Civil Engineering', 1, '2025-26', 'N22', '9801000106', true),
(uuid_generate_v4(), 5, 'Dinesh Kumar', 'student.cv007@college.edu', 'CV007', 'Civil Engineering', 1, '2025-26', 'N22', '9801000107', true),
(uuid_generate_v4(), 5, 'Lata Sharma', 'student.cv008@college.edu', 'CV008', 'Civil Engineering', 1, '2025-26', 'N22', '9801000108', true),
(uuid_generate_v4(), 5, 'Gopal Negi', 'student.cv009@college.edu', 'CV009', 'Civil Engineering', 1, '2025-26', 'N22', '9801000109', true),
(uuid_generate_v4(), 5, 'Asha Verma', 'student.cv010@college.edu', 'CV010', 'Civil Engineering', 1, '2025-26', 'N22', '9801000110', true),
(uuid_generate_v4(), 5, 'Ramesh Gupta', 'student.cv011@college.edu', 'CV011', 'Civil Engineering', 1, '2025-26', 'N22', '9801000111', true),
(uuid_generate_v4(), 5, 'Kanta Devi', 'student.cv012@college.edu', 'CV012', 'Civil Engineering', 1, '2025-26', 'N22', '9801000112', true),
(uuid_generate_v4(), 5, 'Suresh Pathania', 'student.cv013@college.edu', 'CV013', 'Civil Engineering', 1, '2025-26', 'N22', '9801000113', true),
(uuid_generate_v4(), 5, 'Meera Joshi', 'student.cv014@college.edu', 'CV014', 'Civil Engineering', 1, '2025-26', 'N22', '9801000114', true),
(uuid_generate_v4(), 5, 'Yash Dogra', 'student.cv015@college.edu', 'CV015', 'Civil Engineering', 1, '2025-26', 'N22', '9801000115', true),
(uuid_generate_v4(), 5, 'Babita Bhatt', 'student.cv016@college.edu', 'CV016', 'Civil Engineering', 1, '2025-26', 'N22', '9801000116', true),
(uuid_generate_v4(), 5, 'Prem Kumar', 'student.cv017@college.edu', 'CV017', 'Civil Engineering', 1, '2025-26', 'N22', '9801000117', true),
(uuid_generate_v4(), 5, 'Reena Pandit', 'student.cv018@college.edu', 'CV018', 'Civil Engineering', 1, '2025-26', 'N22', '9801000118', true),
(uuid_generate_v4(), 5, 'Jagdish Yadav', 'student.cv019@college.edu', 'CV019', 'Civil Engineering', 1, '2025-26', 'N22', '9801000119', true),
(uuid_generate_v4(), 5, 'Savita Kapoor', 'student.cv020@college.edu', 'CV020', 'Civil Engineering', 1, '2025-26', 'N22', '9801000120', true),
(uuid_generate_v4(), 5, 'Naresh Chand', 'student.cv021@college.edu', 'CV021', 'Civil Engineering', 1, '2025-26', 'N22', '9801000121', true),
-- Year 2
(uuid_generate_v4(), 5, 'Ashish Thakur', 'student.cv022@college.edu', 'CV022', 'Civil Engineering', 2, '2024-25', 'N22', '9801000201', true),
(uuid_generate_v4(), 5, 'Usha Rana', 'student.cv023@college.edu', 'CV023', 'Civil Engineering', 2, '2024-25', 'N22', '9801000202', true),
(uuid_generate_v4(), 5, 'Mukesh Verma', 'student.cv024@college.edu', 'CV024', 'Civil Engineering', 2, '2024-25', 'N22', '9801000203', true),
(uuid_generate_v4(), 5, 'Pushpa Devi', 'student.cv025@college.edu', 'CV025', 'Civil Engineering', 2, '2024-25', 'N22', '9801000204', true),
(uuid_generate_v4(), 5, 'Kishan Singh', 'student.cv026@college.edu', 'CV026', 'Civil Engineering', 2, '2024-25', 'N22', '9801000205', true),
(uuid_generate_v4(), 5, 'Radha Sharma', 'student.cv027@college.edu', 'CV027', 'Civil Engineering', 2, '2024-25', 'N22', '9801000206', true),
(uuid_generate_v4(), 5, 'Satish Gupta', 'student.cv028@college.edu', 'CV028', 'Civil Engineering', 2, '2024-25', 'N22', '9801000207', true),
(uuid_generate_v4(), 5, 'Geeta Negi', 'student.cv029@college.edu', 'CV029', 'Civil Engineering', 2, '2024-25', 'N22', '9801000208', true),
(uuid_generate_v4(), 5, 'Vijay Chauhan', 'student.cv030@college.edu', 'CV030', 'Civil Engineering', 2, '2024-25', 'N22', '9801000209', true),
(uuid_generate_v4(), 5, 'Shanti Patel', 'student.cv031@college.edu', 'CV031', 'Civil Engineering', 2, '2024-25', 'N22', '9801000210', true),
(uuid_generate_v4(), 5, 'Dilip Mehta', 'student.cv032@college.edu', 'CV032', 'Civil Engineering', 2, '2024-25', 'N22', '9801000211', true),
(uuid_generate_v4(), 5, 'Sunita Kapoor', 'student.cv033@college.edu', 'CV033', 'Civil Engineering', 2, '2024-25', 'N22', '9801000212', true),
(uuid_generate_v4(), 5, 'Ratan Dogra', 'student.cv034@college.edu', 'CV034', 'Civil Engineering', 2, '2024-25', 'N22', '9801000213', true),
(uuid_generate_v4(), 5, 'Manju Pathania', 'student.cv035@college.edu', 'CV035', 'Civil Engineering', 2, '2024-25', 'N22', '9801000214', true),
(uuid_generate_v4(), 5, 'Baldev Joshi', 'student.cv036@college.edu', 'CV036', 'Civil Engineering', 2, '2024-25', 'N22', '9801000215', true),
(uuid_generate_v4(), 5, 'Nirmala Bhatt', 'student.cv037@college.edu', 'CV037', 'Civil Engineering', 2, '2024-25', 'N22', '9801000216', true),
(uuid_generate_v4(), 5, 'Umesh Pandit', 'student.cv038@college.edu', 'CV038', 'Civil Engineering', 2, '2024-25', 'N22', '9801000217', true),
(uuid_generate_v4(), 5, 'Chandra Yadav', 'student.cv039@college.edu', 'CV039', 'Civil Engineering', 2, '2024-25', 'N22', '9801000218', true),
(uuid_generate_v4(), 5, 'Hema Chand', 'student.cv040@college.edu', 'CV040', 'Civil Engineering', 2, '2024-25', 'N22', '9801000219', true),
(uuid_generate_v4(), 5, 'Tara Singh', 'student.cv041@college.edu', 'CV041', 'Civil Engineering', 2, '2024-25', 'N22', '9801000220', true),
(uuid_generate_v4(), 5, 'Dev Bhardwaj', 'student.cv042@college.edu', 'CV042', 'Civil Engineering', 2, '2024-25', 'N22', '9801000221', true),
-- Year 3
(uuid_generate_v4(), 5, 'Raj Kumar', 'student.cv043@college.edu', 'CV043', 'Civil Engineering', 3, '2023-24', 'N22', '9801000301', true),
(uuid_generate_v4(), 5, 'Anita Devi', 'student.cv044@college.edu', 'CV044', 'Civil Engineering', 3, '2023-24', 'N22', '9801000302', true),
(uuid_generate_v4(), 5, 'Manoj Thakur', 'student.cv045@college.edu', 'CV045', 'Civil Engineering', 3, '2023-24', 'N22', '9801000303', true),
(uuid_generate_v4(), 5, 'Sarla Sharma', 'student.cv046@college.edu', 'CV046', 'Civil Engineering', 3, '2023-24', 'N22', '9801000304', true),
(uuid_generate_v4(), 5, 'Lalit Gupta', 'student.cv047@college.edu', 'CV047', 'Civil Engineering', 3, '2023-24', 'N22', '9801000305', true),
(uuid_generate_v4(), 5, 'Gayatri Verma', 'student.cv048@college.edu', 'CV048', 'Civil Engineering', 3, '2023-24', 'N22', '9801000306', true),
(uuid_generate_v4(), 5, 'Harish Rana', 'student.cv049@college.edu', 'CV049', 'Civil Engineering', 3, '2023-24', 'N22', '9801000307', true),
(uuid_generate_v4(), 5, 'Padma Chauhan', 'student.cv050@college.edu', 'CV050', 'Civil Engineering', 3, '2023-24', 'N22', '9801000308', true),
(uuid_generate_v4(), 5, 'Trilok Singh', 'student.cv051@college.edu', 'CV051', 'Civil Engineering', 3, '2023-24', 'N22', '9801000309', true),
(uuid_generate_v4(), 5, 'Kamlesh Negi', 'student.cv052@college.edu', 'CV052', 'Civil Engineering', 3, '2023-24', 'N22', '9801000310', true),
(uuid_generate_v4(), 5, 'Veena Patel', 'student.cv053@college.edu', 'CV053', 'Civil Engineering', 3, '2023-24', 'N22', '9801000311', true),
(uuid_generate_v4(), 5, 'Prakash Mehta', 'student.cv054@college.edu', 'CV054', 'Civil Engineering', 3, '2023-24', 'N22', '9801000312', true),
(uuid_generate_v4(), 5, 'Indra Joshi', 'student.cv055@college.edu', 'CV055', 'Civil Engineering', 3, '2023-24', 'N22', '9801000313', true),
(uuid_generate_v4(), 5, 'Shobha Dogra', 'student.cv056@college.edu', 'CV056', 'Civil Engineering', 3, '2023-24', 'N22', '9801000314', true),
(uuid_generate_v4(), 5, 'Jagmohan Bhatt', 'student.cv057@college.edu', 'CV057', 'Civil Engineering', 3, '2023-24', 'N22', '9801000315', true),
(uuid_generate_v4(), 5, 'Leela Pathania', 'student.cv058@college.edu', 'CV058', 'Civil Engineering', 3, '2023-24', 'N22', '9801000316', true),
(uuid_generate_v4(), 5, 'Mohan Pandit', 'student.cv059@college.edu', 'CV059', 'Civil Engineering', 3, '2023-24', 'N22', '9801000317', true),
(uuid_generate_v4(), 5, 'Bimla Yadav', 'student.cv060@college.edu', 'CV060', 'Civil Engineering', 3, '2023-24', 'N22', '9801000318', true),
(uuid_generate_v4(), 5, 'Nand Kumar', 'student.cv061@college.edu', 'CV061', 'Civil Engineering', 3, '2023-24', 'N22', '9801000319', true),
(uuid_generate_v4(), 5, 'Rani Kapoor', 'student.cv062@college.edu', 'CV062', 'Civil Engineering', 3, '2023-24', 'N22', '9801000320', true),
(uuid_generate_v4(), 5, 'Girish Chand', 'student.cv063@college.edu', 'CV063', 'Civil Engineering', 3, '2023-24', 'N22', '9801000321', true)
ON CONFLICT (department, year, roll_no) DO NOTHING;

-- ============================================================
-- MECHANICAL ENGINEERING (20 students per year = 60 total)
-- ============================================================
INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Anil','Bhushan','Chetan','Dalip','Eshwar','Firoz','Gagan','Hemant','Inder','Jatin','Kamal','Laxman','Mohan','Neeraj','Onkar','Piyush','Qasim','Ratan','Sagar','Tarak'])[i],
  'student.me' || LPAD(i::text, 3, '0') || '@college.edu',
  'ME' || LPAD(i::text, 3, '0'),
  'Mechanical Engineering', 1, '2025-26', 'N22',
  '9802' || LPAD((100 + i)::text, 6, '0'), true
FROM generate_series(1, 20) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;

INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Abha','Bharti','Chandni','Durga','Ekta','Falguni','Garima','Hansa','Ira','Jaya','Kriti','Lakshmi','Mala','Nalini','Omika','Pallavi','Qurat','Ritu','Sushma','Tanvi'])[i],
  'student.me' || LPAD((20+i)::text, 3, '0') || '@college.edu',
  'ME' || LPAD((20+i)::text, 3, '0'),
  'Mechanical Engineering', 2, '2024-25', 'N22',
  '9802' || LPAD((200 + i)::text, 6, '0'), true
FROM generate_series(1, 20) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;

INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Ajit','Bhola','Chirag','Dev','Eklavya','Fukran','Gopal','Hari','Indra','Jeevan','Kundan','Lal','Madhu','Nitin','Om','Param','Qadir','Ram','Shyam','Tilak'])[i],
  'student.me' || LPAD((40+i)::text, 3, '0') || '@college.edu',
  'ME' || LPAD((40+i)::text, 3, '0'),
  'Mechanical Engineering', 3, '2023-24', 'N22',
  '9802' || LPAD((300 + i)::text, 6, '0'), true
FROM generate_series(1, 20) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;

-- ============================================================
-- ELECTRICAL ENGINEERING (21 students per year = 63 total)
-- ============================================================
INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Alok','Binod','Chandra','Dharam','Eknath','Farhan','Girish','Hitesh','Ishwar','Jai','Keshav','Liladhar','Manohar','Narayan','Ojas','Pramod','Raghav','Shiv','Trilok','Uday','Varun'])[i],
  'student.ee' || LPAD(i::text, 3, '0') || '@college.edu',
  'EE' || LPAD(i::text, 3, '0'),
  'Electrical Engineering', 1, '2025-26', 'N22',
  '9803' || LPAD((100 + i)::text, 6, '0'), true
FROM generate_series(1, 21) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;

INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Amita','Babli','Champa','Damini','Ela','Fatima','Gouri','Hemlata','Indu','Jyoti','Kalpana','Lajwanti','Madhu','Neera','Omwati','Prabha','Ranjana','Saroj','Tanu','Uma','Vimla'])[i],
  'student.ee' || LPAD((21+i)::text, 3, '0') || '@college.edu',
  'EE' || LPAD((21+i)::text, 3, '0'),
  'Electrical Engineering', 2, '2024-25', 'N22',
  '9803' || LPAD((200 + i)::text, 6, '0'), true
FROM generate_series(1, 21) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;

INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Amar','Bakshi','Chetram','Daulat','Fakir','Ghanshyam','Hardayal','Inder','Jagat','Kedar','Lakhan','Mangal','Natha','Onkar','Pawan','Raghu','Shankar','Tek','Udham','Vikram','Wazir'])[i],
  'student.ee' || LPAD((42+i)::text, 3, '0') || '@college.edu',
  'EE' || LPAD((42+i)::text, 3, '0'),
  'Electrical Engineering', 3, '2023-24', 'N22',
  '9803' || LPAD((300 + i)::text, 6, '0'), true
FROM generate_series(1, 21) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;

-- ============================================================
-- ELECTRONICS & COMMUNICATION (20 students per year = 60 total)
-- ============================================================
INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Akash','Balraj','Chitranjan','Dalvir','Eshwari','Farooq','Gaurav','Himanshu','Iqbal','Jaspal','Kuldeep','Lalit','Mahesh','Navin','Opinder','Parkash','Rajinder','Surjeet','Tarsem','Uttam'])[i],
  'student.ec' || LPAD(i::text, 3, '0') || '@college.edu',
  'EC' || LPAD(i::text, 3, '0'),
  'Electronics & Communication', 1, '2025-26', 'N22',
  '9804' || LPAD((100 + i)::text, 6, '0'), true
FROM generate_series(1, 20) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;

INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Ajay','Balbir','Chandar','Dayal','Fakir','Girdhari','Hem','Inder','Jassi','Karma','Lekh','Madan','Nand','Onkar','Prem','Roop','Sher','Tika','Umra','Vidya'])[i],
  'student.ec' || LPAD((20+i)::text, 3, '0') || '@college.edu',
  'EC' || LPAD((20+i)::text, 3, '0'),
  'Electronics & Communication', 2, '2024-25', 'N22',
  '9804' || LPAD((200 + i)::text, 6, '0'), true
FROM generate_series(1, 20) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;

INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Aman','Bhim','Chaman','Desh','Ehsan','Fateh','Ganga','Hans','Iqbal','Jaggi','Kirat','Lakha','Moti','Natha','Ompal','Phalgu','Ravi','Sundar','Teja','Uday'])[i],
  'student.ec' || LPAD((40+i)::text, 3, '0') || '@college.edu',
  'EC' || LPAD((40+i)::text, 3, '0'),
  'Electronics & Communication', 3, '2023-24', 'N22',
  '9804' || LPAD((300 + i)::text, 6, '0'), true
FROM generate_series(1, 20) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;

-- ============================================================
-- INFORMATION TECHNOLOGY (23 students per year = 69 total)
-- ============================================================
INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Aarushi','Bhavna','Charu','Devika','Esha','Farheen','Gitanjali','Harshita','Isha','Juhi','Kinjal','Lavanya','Mansi','Nidhi','Ojasvi','Paridhi','Qamar','Riddhi','Sanya','Tanishka','Urvi','Vrinda','Wafa'])[i],
  'student.it' || LPAD(i::text, 3, '0') || '@college.edu',
  'IT' || LPAD(i::text, 3, '0'),
  'Information Technology', 1, '2025-26', 'N22',
  '9805' || LPAD((100 + i)::text, 6, '0'), true
FROM generate_series(1, 23) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;

INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Abhinav','Bhupesh','Chiranjeev','Daksh','Eshan','Farhan','Gaurang','Harsh','Ishan','Jayant','Kartik','Lakshya','Mihir','Nakul','Omkar','Pranav','Raghav','Sahil','Tejas','Utkarsh','Vaibhav','Yash','Zubin'])[i],
  'student.it' || LPAD((23+i)::text, 3, '0') || '@college.edu',
  'IT' || LPAD((23+i)::text, 3, '0'),
  'Information Technology', 2, '2024-25', 'N22',
  '9805' || LPAD((200 + i)::text, 6, '0'), true
FROM generate_series(1, 23) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;

INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year, academic_year, scheme, phone, is_active)
SELECT uuid_generate_v4(), 5,
  (ARRAY['Aditi','Bhawna','Chhavi','Dimple','Ekta','Fiza','Gargi','Hema','Iti','Janki','Kushi','Lila','Monika','Neelam','Ojaswini','Pratibha','Rachna','Shikha','Tanya','Urvashi','Vandana','Yamini','Zara'])[i],
  'student.it' || LPAD((46+i)::text, 3, '0') || '@college.edu',
  'IT' || LPAD((46+i)::text, 3, '0'),
  'Information Technology', 3, '2023-24', 'N22',
  '9805' || LPAD((300 + i)::text, 6, '0'), true
FROM generate_series(1, 23) AS i
ON CONFLICT (department, year, roll_no) DO NOTHING;
