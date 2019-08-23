require('dotenv').config();
const { expect } = require('chai');
const chai = require('chai');
const supertest = require('supertest');
const chaiHttp = require('chai-http');

global.expect = expect;
global.supertest = supertest;
global.chai = chai;
global.chaiHttp = chaiHttp;
