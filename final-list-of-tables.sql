use CRM_DATABASE;


create table org_table(
	org_id int primary key identity(0,1),
	org_name varchar(50) not null,  -- Unique constraint was added using the alter key word with uniqueconstraint as name
	org_type bit not null -- 1 if organization is personal, 0 if organization is professional
	constraint unique_org_table_org_name unique(org_name)
);

create table person_table(
	person_id int primary key identity(0,1),
	person_name varchar(20) not null,
	phone bigint not null,
	role varchar(10) not null, -- unique constraint added here also
	email varchar(30) not null, -- unique constraint added here
	password varchar(50) not null,
	constraint unique_person_table_phone unique(phone),
	constraint unique_person_table_email unique(email)
);

create table project_table(
	project_id int primary key identity(0,1),
	project_name varchar(20) not null,
	type varchar(20) not null,
	constraint unique_project_table_project_name unique(project_name)
);

create table frequency_table(
	freq_id int primary key,
	times int not null default 0,
	duration int not null default 0
);

create table task_table(
	task_id int primary key identity(0,1),
	objective varchar(150) not null,
	status bit not null default 0,
	end_date date not null
);

create table employed_table(
	person_id int primary key,
	org_id int not null,
	constraint fk_employeed_table_person_id foreign key(person_id) references person_table(person_id) on delete cascade,
	constraint fk_employeed_table_org_id foreign key(org_id) references org_table(org_id) on delete cascade
);

create table has_table(
	project_id int not null,
	task_id int not null,
	primary key(project_id, task_id),
	constraint fk_has_table_project_id foreign key(project_id) references project_table(project_id) on delete cascade,
	constraint fk_has_table_task_id foreign key(task_id) references task_table(task_id) on delete cascade
);

create table leads_table(
	person_id int not null primary key,
	leader_id int not null,
	constraint fk_leads_table_person_id foreign key(person_id) references person_table(person_id) on delete cascade,
	constraint fk_leads_table_leader_id foreign key(leader_id) references person_table(person_id) on delete no action
);



create table worked_by_table(
	person_id int primary key,
	project_id int not null,
	constraint fk_worked_by_table_person_id foreign key (person_id) references person_table(person_id) on delete cascade,
	constraint fk_worked_by_table_project_id foreign key (project_id) references project_table(project_id) on delete cascade
);

create table manages_table(
	project_id int primary key,
	org_id int not null,
	constraint fk_manages_table_person_id foreign key (project_id) references project_table(project_id) on delete cascade,
	constraint fk_manages_table_org_id foreign key (org_id) references org_table(org_id) on delete cascade
);

create table assigned_table(
	person_id int,
	task_id int,
	assignee_id int not null,
	primary key(person_id,task_id),
	constraint fk_assigned_table_person_id foreign key (person_id) references person_table(person_id) on delete cascade,
	constraint fk_assigned_table_task_id foreign key (task_id) references task_table(task_id) on delete cascade,
	constraint fk_assigned_table_assignee_id foreign key (assignee_id) references person_table(person_id)
);
