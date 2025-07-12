create table tb_user (
 user_id int not null auto_increment primary key,
 user_uuid varchar(36) not null unique,
 email VARCHAR(255) NOT NULL UNIQUE,
 full_name VARCHAR(255) NOT NULL,
 password VARCHAR(128) NOT NULL,
 password_salt VARCHAR(36) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 deleted_at TIMESTAMP NULL,
 INDEX idx_user_uuid (user_uuid),
 INDEX idx_email (email),
 INDEX idx_deleted_at (deleted_at)
);

create table tb_food (
 food_id int not null auto_increment primary key,
 food_uuid varchar(36) not null unique,
 food_name varchar(255) not null,
 kcal_per_serving DECIMAL(8,2) NOT NULL ,
 carbs_per_serving DECIMAL(8,2) NOT NULL ,
 protein_per_serving DECIMAL(8,2) NOT NULL ,
 fat_per_serving DECIMAL(8,2) NOT NULL ,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 deleted_at TIMESTAMP NULL,
 index idx_food_uuid (food_uuid),
 index idx_food_name (food_name),
 INDEX idx_deleted_at (deleted_at)
);

CREATE TABLE tb_meal_plan (
 meal_plan_id int not null auto_increment primary key,
 meal_plan_uuid varchar(36) not null unique,
 patient_id int not null,
 name varchar(255) not null,
 description text null,
 created_at timestamp default current_timestamp,
 updated_at timestamp default current_timestamp ON UPDATE current_timestamp,
 deleted_at timestamp null,
 foreign key (patient_id) references tb_patient(patient_id),
 index idx_meal_plan_uuid (meal_plan_uuid),
 index idx_meal_plan_patient_id (patient_id),
 index idx_meal_plan_deleted_at (deleted_at)
);

create table tb_meal (
meal_id int not null auto_increment primary key,
meal_uuid varchar(36) not null unique,
meal_plan_id int not null,
name varchar(255) not null,
description text null,
meal_order int not null default 0,
created_at timestamp default current_timestamp,
 updated_at timestamp default current_timestamp ON UPDATE current_timestamp,
 deleted_at timestamp null,
 foreign key (meal_plan_id) references tb_meal_plan(meal_plan_id),
 index idx_meal_uuid (meal_uuid),
 index idx_meal_meal_plan_id (meal_plan_id),
 index idx_meal_order (meal_order),
 index idx_meal_deleted_at (deleted_at)
);

create table tb_meal_food (
meal_food_id int not null auto_increment primary key,
meal_id int not null,
food_id int not null,
quantity int not null default 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
foreign key (meal_id) references tb_meal(meal_id),
foreign key (food_id) references tb_food(food_id),
UNIQUE KEY unique_meal_food (meal_id, food_id),
index idx_meal_food_meal_id (meal_id),
index idx_meal_food_food_id (food_id)
);

create table tb_patient (
patient_id int auto_increment primary key,
patient_uuid varchar(36) not null unique,
email varchar(255) not null unique,
name varchar(255) not null,
weight decimal(8,2) not null,
height decimal (8,2) not null,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL,
  INDEX idx_patient_uuid (patient_uuid),
  INDEX idx_email (email),
  INDEX idx_deleted_at (deleted_at)
);
