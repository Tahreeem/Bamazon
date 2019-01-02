-- Drops the bamazon_db if it already exists --
DROP DATABASE IF EXISTS bamazon_db;
-- Create a database called bamazon_db --
CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products(
  -- Creates a numeric column called "item_id" which will automatically increment its default value as we create new rows. --
  item_id INTEGER AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(100),
  department_name VARCHAR(100),
  price DECIMAL(10,2),
  stock_quantity INTEGER,
  PRIMARY KEY (item_id),
  UNIQUE INDEX `product_name_UNIQUE` (`item_id` ASC) VISIBLE
);

-- Creates 10 new rows; Dummy Data --
INSERT INTO products (item_id,product_name,department_name,price,stock_quantity) 
VALUES (1,"ARDUINO UNO WIFI REV2","Electronics",44.90,60);

INSERT INTO products (item_id,product_name,department_name,price,stock_quantity) 
VALUES (2,"Raspberry Pi 3 B+","Electronics",98.99,10);

INSERT INTO products (item_id,product_name,department_name,price,stock_quantity) 
VALUES (3,"ODROID-C2","Electronics",45.99,20);

INSERT INTO products (item_id,product_name,department_name,price,stock_quantity) 
VALUES (4,"Tinker Board S","Electronics",109.98,5);

INSERT INTO products (item_id,product_name,department_name,price,stock_quantity) 
VALUES (5,"9DOF IMU Sensor","Electronics",18.99,20);

INSERT INTO products (item_id,product_name,department_name,price,stock_quantity) 
VALUES (6,"17 Values 1/4W 1% Resistor Kit, 0 Ohm-1M Ohm","Electronics",12.98,100);

INSERT INTO products (item_id,product_name,department_name,price,stock_quantity) 
VALUES (7,"15 Values 0.1uF-220uF Electrolytic Capacitor Kit","Electronics",14.99,5);

INSERT INTO products (item_id,product_name,department_name,price,stock_quantity) 
VALUES (8,"10Values Rectifier Diode Kit 1N4001~1N4007, 1N5817~1N5819","Electronics",12.19,50);

INSERT INTO products (item_id,product_name,department_name,price,stock_quantity) 
VALUES (9,"2N2222 NPN TO-92 Plastic-Encapsulate Power Transistors 75V 600mA","Electronics",4.99,13);

INSERT INTO products (item_id,product_name,department_name,price,stock_quantity) 
VALUES (10,"Toroid Inductor, 220uH, 59m Ohm, 4A Coil","Electronics",8.39,7);


