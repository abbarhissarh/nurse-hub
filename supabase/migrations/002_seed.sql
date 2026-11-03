-- Categories and DRAFT sample products. Prices are placeholders: edit them.
insert into public.categories (name, slug, description) values
('Anatomy and Physiology','anatomy-physiology','Body structure and function study resources.'),
('Pharmacology','pharmacology','Drug classes, actions and safe administration.'),
('Medical-Surgical Nursing','medical-surgical-nursing','Revision notes for adult health nursing.'),
('Maternal and Child Health','maternal-child-health','Antenatal, labour, postnatal and paediatric care.'),
('Community Health Nursing','community-health-nursing','Public and community health practice.'),
('Nursing Procedures','nursing-procedures','Step-by-step clinical procedure guides.'),
('Nursing Examination Preparation','exam-preparation','Exam preparation for school and NMCN exams.'),
('Clinical Skills','clinical-skills','Checklists and practical assessment guides.'),
('Nursing Research','nursing-research','Research methods and project writing.'),
('Professional Development','professional-development','Career and study-skills resources.');

insert into public.products (title, slug, short_description, category_id, price, tags)
select t.title, t.slug, t.descr, (select id from public.categories where slug = t.cat), t.price, t.tags from (values
('Complete Anatomy and Physiology Study Guide','anatomy-physiology-study-guide','Organised notes covering the body systems.','anatomy-physiology',3500,array['anatomy','physiology']),
('Pharmacology Made Simple','pharmacology-made-simple','Drug classes explained in plain language.','pharmacology',3000,array['drugs','pharmacology']),
('Medical-Surgical Nursing Revision Notes','medical-surgical-revision-notes','Concise revision notes for adult health nursing.','medical-surgical-nursing',3500,array['med-surg']),
('Nursing Procedures Handbook','nursing-procedures-handbook','Step-by-step guides to common procedures.','nursing-procedures',4000,array['procedures']),
('Nursing Care Plan Templates','nursing-care-plan-templates','Ready-to-use care plan templates.','clinical-skills',2000,array['care plans']),
('Vital Signs Practical Guide','vital-signs-practical-guide','Measuring and recording vital signs.','clinical-skills',1500,array['vital signs']),
('Nursing Mnemonics Collection','nursing-mnemonics-collection','Memory aids for fast revision.','exam-preparation',1500,array['mnemonics']),
('Clinical Skills Checklist','clinical-skills-checklist','Checklists for practical exams.','clinical-skills',2000,array['checklist','practical']),
('Nursing Research Writing Guide','nursing-research-writing-guide','Plan and write your research project.','nursing-research',3000,array['research','project']),
('NMCN Examination Preparation Pack','nmcn-exam-preparation-pack','Preparation resources for NMCN exams.','exam-preparation',5000,array['nmcn','exam']),
('Nursing Flashcards','nursing-flashcards','Flashcards for quick revision.','exam-preparation',2500,array['flashcards']),
('Maternal and Child Health Revision Notes','maternal-child-health-notes','Revision notes for maternal and child health.','maternal-child-health',3500,array['maternal','child']),
('Community Health Nursing Guide','community-health-nursing-guide','A guide to community health practice.','community-health-nursing',3000,array['community']),
('Nursing Drug Calculations Workbook','drug-calculations-workbook','Practice drug dosage calculations.','pharmacology',2500,array['calculations','drugs']),
('Nursing Student Study Planner','nursing-student-study-planner','Plan your semester and revision.','professional-development',1000,array['planner'])
) as t(title,slug,descr,cat,price,tags);
-- All products start as DRAFT. Upload the real file, then publish from the admin dashboard (phase 5).
