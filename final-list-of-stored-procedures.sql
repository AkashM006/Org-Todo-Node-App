

-- To create tasks
create proc spcreateTask 
@obj varchar(150), @end_date varchar(20), @assg varchar(20), @email varchar(30), @org_name varchar(50) 
as 
begin
begin tran
begin try
	insert into task_table(objective,end_date) values(@obj,@end_date);
	declare @role varchar(10);
	declare @org_id int;
	select @role = role from person_table where email = @email;
	if @role = 'admin'
	begin
		insert into has_table(project_id,task_id) 
		values((select project_id from project_table where project_name = @assg),(select IDENT_CURRENT('task_table')));
		insert into assigned_table(person_id,task_id,assignee_id) 
		values((select worked_by_table.person_id from worked_by_table 
		inner join project_table on project_table.project_id = worked_by_table.project_id 
		inner join person_table on person_table.person_id = worked_by_table.person_id where project_name = @assg and role = 'leader'),
		(select IDENT_CURRENT('task_table')),(select person_id from person_table where email=@email));
	end;
	else
	begin
		select @org_id = project_id from worked_by_table where person_id = (select person_id from person_table where email = @assg)
		insert into has_table(project_id,task_id) values(@org_id,(select IDENT_CURRENT('task_table')));
		insert into assigned_table(person_id,task_id,assignee_id) 
		values((select person_id from person_table where email = @assg),
		(select IDENT_CURRENT('task_table')),(select person_id from person_table where email = @email))
	end
commit tran
end try
begin catch
rollback tran
end catch
end;

-- To create an organization
create procedure spCreateOrg 
@orgName varchar(50), @orgType bit, @personName varchar(20), @phone bigint, @email varchar(30), @password varchar(50)
as
begin
	begin tran
	begin try
	insert into org_table(org_name,org_type) values(@orgName,@orgType);
	insert into person_table(person_name,phone,role,email,password) values(@personName,@phone,'admin',@email,@password);
	insert into employed_table (person_id,org_id) values((select IDENT_CURRENT('person_table')),(select ident_current('org_table')));
	commit tran
	end try
	begin catch
	rollback tran
	end catch
end;

-- To create an employee
create proc spCreateUser 
@name varchar(20), @email varchar(30),@phone bigint,@role varchar(10),@org_name varchar(50)
as
begin
begin tran
begin try
if (select count(email) from person_table where email = @email) = 0
	begin
	insert into person_table(person_name,phone,role,email,password) values(@name,@phone,@role,@email,@phone);
	insert into employed_table(person_id,org_id) values((select IDENT_CURRENT('person_table')),(select org_id from org_table where org_name=@org_name));
	end;
else
	begin
	update person_table set person_name=@name,phone=@phone,role=@role from person_table 
	inner join employed_table on employed_table.person_id=(select person_id from person_table where email=@email) 
	inner join org_table on employed_table.org_id = (select org_id from org_table where org_name = @org_name) 
	where person_table.email = @email
	end;
commit tran
end try
begin catch
rollback tran
end catch
end;

-- To create a project
alter proc spCreateProject 
@project_name varchar(20), @type varchar(20), @org_name varchar(50), @email varchar(30) 
as
begin
begin tran
begin try
	insert into project_table(project_name,type) values(@project_name,@type);
	insert into manages_table(project_id,org_id) values((select IDENT_CURRENT('project_table')), (select org_id from org_table where org_name = @org_name));
	update person_table set role = 'leader' where email = @email;
	insert into worked_by_table(person_id,project_id) values((select person_id from person_table where email = @email),(select IDENT_CURRENT('project_table')));
	commit tran
end try
begin catch
rollback tran
end catch
end;

--To add an employee to a project
alter proc spAddEmpProject 
@email varchar(30), @project_name varchar(20), @org_name varchar(50) 
as 
begin
begin tran
begin try
	declare @pro_id int;
	declare @per_id int;
	select @pro_id = project_id from project_table where project_name = @project_name;
	select @per_id = person_id from person_table where email = @email;
	update person_table set role = 'employee' where email = @email;
	print @pro_id
	print @per_id
	insert into worked_by_table(person_id,project_id) values(@per_id,@pro_id);
	declare @leader_id int;
	select @leader_id = worked_by_table.person_id from worked_by_table 
	inner join project_table on project_table.project_id = worked_by_table.project_id and project_name = @project_name
	inner join person_table on worked_by_table.person_id = person_table.person_id and role = 'leader'
	print @leader_id
	insert into leads_table(person_id,leader_id) values(@per_id,@leader_id);
commit tran
end try
begin catch
rollback tran
end catch
end;

-- To get number of employees and task in a project
alter proc spGetProjectDetail 
@project_name varchar(20), @employee_count int output, @task_count int output 
as 
begin
select @task_count = count(*) from project_table 
left join has_table on has_table.project_id = project_table.project_id 
where project_name = 'Hello' and task_id is not null
select @employee_count = count(*) from worked_by_table 
left join person_table on person_table.person_id = worked_by_table.person_id 
inner join project_table on project_table.project_id = worked_by_table.project_id and project_name = @project_name
end;

