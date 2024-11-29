-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2024-10-29 23:04:59.607

DROP DATABASE IF EXISTS portfolify;
CREATE DATABASE portfolify;
\c portfolify


CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- tables
-- Table: PORTFOLIOS
CREATE TABLE PORTFOLIOS (
    PORTFOLIO_ID UUID DEFAULT public.uuid_generate_v4()  NOT NULL,
    NAME varchar(20)  NOT NULL,
    BALANCE real  NOT NULL,
    USER_ID UUID NOT NULL,
    CONSTRAINT PORTFOLIOS_pk PRIMARY KEY (PORTFOLIO_ID)
);

-- Table: STOCKS
CREATE TABLE STOCKS (
    TICKER_SYMBOL varchar(20)  NOT NULL,
    NAME varchar(100)  NOT NULL,
    CONSTRAINT STOCKS_pk PRIMARY KEY (TICKER_SYMBOL)
);

-- Table: STOCKS_PORTFOLIOS
CREATE TABLE STOCKS_PORTFOLIOS (
    TICKER_SYMBOL varchar(20)  NOT NULL,
    PORTFOLIO_ID varchar(20)  NOT NULL,
    CONSTRAINT STOCKS_PORTFOLIOS_pk PRIMARY KEY (TICKER_SYMBOL,PORTFOLIO_ID)
);

-- Table: TRANSACTIONS
CREATE TABLE TRANSACTIONS (
    TRANSACTION_ID UUID DEFAULT public.uuid_generate_v4()  NOT NULL,
    TOTAL_AMOUNT real  NOT NULL,
    QUANTITY real  NOT NULL,
    PRICE_PER_SHARE real  NOT NULL,
    TRANSACTION_DATE timestamp  NOT NULL,
    STOCKS_TICKER_SYMBOL varchar(20)  NOT NULL,
    PORTFOLIO_ID varchar(20)  NOT NULL,
    CONSTRAINT TRANSACTIONS_pk PRIMARY KEY (TRANSACTION_ID)
);

-- Table: USERS
CREATE TABLE USERS (
    USER_ID UUID DEFAULT public.uuid_generate_v4()  NOT NULL,
    USERNAME varchar(20)  NOT NULL,
    PASSWORD varchar(100)  NOT NULL,
    CONSTRAINT USERS_pk PRIMARY KEY (USER_ID)
);

-- Table: TOKENS
CREATE TABLE TOKENS (
    CODE varchar(100)  NOT NULL,
    USER_ID UUID NOT NULL
);

-- foreign keys
-- Reference: PORTFOLIOS_USERS (table: PORTFOLIOS)
ALTER TABLE PORTFOLIOS ADD CONSTRAINT PORTFOLIOS_USERS
    FOREIGN KEY (USER_ID)
    REFERENCES USERS (USER_ID)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: STOCKS_PORTFOLIOS_PORTFOLIOS (table: STOCKS_PORTFOLIOS)
ALTER TABLE STOCKS_PORTFOLIOS ADD CONSTRAINT STOCKS_PORTFOLIOS_PORTFOLIOS
    FOREIGN KEY (PORTFOLIO_ID)
    REFERENCES PORTFOLIOS (PORTFOLIO_ID)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: STOCKS_PORTFOLIOS_STOCKS (table: STOCKS_PORTFOLIOS)
ALTER TABLE STOCKS_PORTFOLIOS ADD CONSTRAINT STOCKS_PORTFOLIOS_STOCKS
    FOREIGN KEY (TICKER_SYMBOL)
    REFERENCES STOCKS (TICKER_SYMBOL)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: TRANSACTIONS_PORTFOLIOS (table: TRANSACTIONS)
ALTER TABLE TRANSACTIONS ADD CONSTRAINT TRANSACTIONS_PORTFOLIOS
    FOREIGN KEY (PORTFOLIO_ID)
    REFERENCES PORTFOLIOS (PORTFOLIO_ID)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: TRANSACTIONS_STOCKS (table: TRANSACTIONS)
ALTER TABLE TRANSACTIONS ADD CONSTRAINT TRANSACTIONS_STOCKS
    FOREIGN KEY (STOCKS_TICKER_SYMBOL)
    REFERENCES STOCKS (TICKER_SYMBOL)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- End of file.

