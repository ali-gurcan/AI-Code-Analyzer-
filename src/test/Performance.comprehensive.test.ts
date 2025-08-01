import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiClient } from '../classes/GeminiClient';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Performance and Refactoring Analysis Tests', () => {
  let client: GeminiClient;
  const validApiKey = 'test-api-key-123';

  beforeEach(() => {
    vi.clearAllMocks();
    client = new GeminiClient(validApiKey);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Performance Issue Detection', () => {
    it('should detect inefficient DOM manipulation', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Avoid repeated DOM queries - cache elements',
                  'Use DocumentFragment for multiple DOM insertions',
                  'Consider virtual DOM or batch DOM updates'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const inefficientDomCode = `
        function addItems(items) {
          for (let i = 0; i < items.length; i++) {
            const list = document.getElementById('item-list'); // Repeated query!
            const li = document.createElement('li');
            li.textContent = items[i];
            list.appendChild(li);
          }
        }
      `;

      const result = await client.analyzeCode(inefficientDomCode);
      
      expect(result.refactoringSuggestions).toContain('Avoid repeated DOM queries - cache elements');
      expect(result.refactoringSuggestions).toContain('Use DocumentFragment for multiple DOM insertions');
    });

    it('should detect inefficient loops and algorithms', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'O(n²) complexity detected - consider using Set or Map',
                  'Nested loops can be optimized with hash lookup',
                  'Consider using built-in array methods for better performance'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const inefficientLoopCode = `
        function findDuplicates(arr) {
          const duplicates = [];
          for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
              if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
                duplicates.push(arr[i]);
              }
            }
          }
          return duplicates;
        }
      `;

      const result = await client.analyzeCode(inefficientLoopCode);
      
      expect(result.refactoringSuggestions).toContain('O(n²) complexity detected - consider using Set or Map');
      expect(result.refactoringSuggestions).toContain('Nested loops can be optimized with hash lookup');
    });

    it('should detect memory leaks and inefficient memory usage', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Potential memory leak: event listeners not removed',
                  'Global variables may cause memory retention',
                  'Consider using WeakMap for cache to allow garbage collection'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const memoryLeakCode = `
        const cache = {}; // Global cache that grows indefinitely
        
        function setupHandler(element) {
          element.addEventListener('click', function() {
            // Handler not removed when element is destroyed
            console.log('Clicked');
          });
        }
        
        function cacheData(key, data) {
          cache[key] = data; // Never cleaned up
        }
      `;

      const result = await client.analyzeCode(memoryLeakCode);
      
      expect(result.refactoringSuggestions).toContain('Potential memory leak: event listeners not removed');
      expect(result.refactoringSuggestions).toContain('Consider using WeakMap for cache to allow garbage collection');
    });

    it('should detect inefficient database operations', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'N+1 query problem detected - use JOIN or batch queries',
                  'Missing database indexes on frequently queried columns',
                  'Consider query optimization and connection pooling'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const inefficientDbCode = `
        async function getUsersWithPosts() {
          const users = await db.query('SELECT * FROM users');
          
          for (const user of users) {
            // N+1 problem!
            user.posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
          }
          
          return users;
        }
      `;

      const result = await client.analyzeCode(inefficientDbCode);
      
      expect(result.refactoringSuggestions).toContain('N+1 query problem detected - use JOIN or batch queries');
      expect(result.refactoringSuggestions).toContain('Consider query optimization and connection pooling');
    });
  });

  describe('Code Structure and Design Pattern Improvements', () => {
    it('should suggest better function structure and separation of concerns', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Function is too long - consider breaking into smaller functions',
                  'Multiple responsibilities detected - violates Single Responsibility Principle',
                  'Extract validation logic into separate function',
                  'Consider using dependency injection for better testability'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const longFunctionCode = `
        function processUserRegistration(userData) {
          // Validation
          if (!userData.email) throw new Error('Email required');
          if (!userData.password) throw new Error('Password required');
          if (userData.password.length < 8) throw new Error('Password too short');
          if (!userData.email.includes('@')) throw new Error('Invalid email');
          
          // Password hashing
          const salt = crypto.randomBytes(16);
          const hashedPassword = crypto.pbkdf2Sync(userData.password, salt, 10000, 64, 'sha512');
          
          // Database operations
          const existingUser = db.findOne('users', { email: userData.email });
          if (existingUser) throw new Error('User exists');
          
          const user = db.insert('users', {
            email: userData.email,
            password: hashedPassword,
            salt: salt,
            created_at: new Date()
          });
          
          // Email sending
          const emailHtml = \`<h1>Welcome \${userData.email}!</h1>\`;
          sendEmail(userData.email, 'Welcome', emailHtml);
          
          // Audit logging
          console.log(\`User registered: \${userData.email}\`);
          
          return user;
        }
      `;

      const result = await client.analyzeCode(longFunctionCode);
      
      expect(result.refactoringSuggestions).toContain('Function is too long - consider breaking into smaller functions');
      expect(result.refactoringSuggestions).toContain('Multiple responsibilities detected - violates Single Responsibility Principle');
      expect(result.refactoringSuggestions).toContain('Extract validation logic into separate function');
    });

    it('should suggest design pattern improvements', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Consider using Strategy pattern for payment methods',
                  'Factory pattern would improve object creation',
                  'Observer pattern could decouple event handling',
                  'Use Builder pattern for complex object construction'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const designPatternCode = `
        function processPayment(type, amount, details) {
          if (type === 'credit_card') {
            // Credit card processing logic
            validateCreditCard(details);
            return chargeCreditCard(amount, details);
          } else if (type === 'paypal') {
            // PayPal processing logic
            return processPayPal(amount, details);
          } else if (type === 'bitcoin') {
            // Bitcoin processing logic
            return processBitcoin(amount, details);
          }
          throw new Error('Unsupported payment type');
        }
        
        function createUser(name, email, type) {
          if (type === 'admin') {
            return { name, email, role: 'admin', permissions: ['read', 'write', 'delete'] };
          } else if (type === 'user') {
            return { name, email, role: 'user', permissions: ['read'] };
          }
        }
      `;

      const result = await client.analyzeCode(designPatternCode);
      
      expect(result.refactoringSuggestions).toContain('Consider using Strategy pattern for payment methods');
      expect(result.refactoringSuggestions).toContain('Factory pattern would improve object creation');
    });

    it('should suggest error handling improvements', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Implement proper error handling hierarchy',
                  'Use custom error classes for different error types',
                  'Add error recovery mechanisms',
                  'Consider using Result/Either pattern for error handling'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const errorHandlingCode = `
        function fetchUserData(userId) {
          try {
            const user = api.getUser(userId);
            return user;
          } catch (error) {
            console.log('Error:', error.message);
            return null; // Silent failure - not ideal
          }
        }
        
        function processData(data) {
          if (!data) {
            throw new Error('No data'); // Generic error
          }
          // Processing logic
        }
      `;

      const result = await client.analyzeCode(errorHandlingCode);
      
      expect(result.refactoringSuggestions).toContain('Implement proper error handling hierarchy');
      expect(result.refactoringSuggestions).toContain('Use custom error classes for different error types');
    });
  });

  describe('Modern JavaScript/TypeScript Improvements', () => {
    it('should suggest modern ES6+ features', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Use const/let instead of var for better scoping',
                  'Replace function expressions with arrow functions',
                  'Use template literals instead of string concatenation',
                  'Destructuring assignment would improve readability',
                  'Consider using async/await instead of promises'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const oldJsCode = `
        var userName = 'John';
        var userAge = 30;
        
        function greetUser(user) {
          var message = 'Hello ' + user.name + ', you are ' + user.age + ' years old!';
          return message;
        }
        
        function fetchData() {
          return fetch('/api/data')
            .then(function(response) {
              return response.json();
            })
            .then(function(data) {
              return data;
            });
        }
      `;

      const result = await client.analyzeCode(oldJsCode);
      
      expect(result.refactoringSuggestions).toContain('Use const/let instead of var for better scoping');
      expect(result.refactoringSuggestions).toContain('Use template literals instead of string concatenation');
      expect(result.refactoringSuggestions).toContain('Consider using async/await instead of promises');
    });

    it('should suggest TypeScript improvements', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Add type annotations for better type safety',
                  'Use interfaces to define object shapes',
                  'Consider using generic types for reusability',
                  'Use union types instead of any',
                  'Implement proper null/undefined handling'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const weakTypescriptCode = `
        function processUser(user: any) {
          return {
            id: user.id,
            name: user.name,
            email: user.email
          };
        }
        
        function calculateTotal(items) { // Missing types
          return items.reduce((sum, item) => sum + item.price, 0);
        }
        
        let result; // Implicit any
        result = fetchData();
      `;

      const result = await client.analyzeCode(weakTypescriptCode);
      
      expect(result.refactoringSuggestions).toContain('Add type annotations for better type safety');
      expect(result.refactoringSuggestions).toContain('Use interfaces to define object shapes');
      expect(result.refactoringSuggestions).toContain('Use union types instead of any');
    });

    it('should suggest functional programming improvements', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Use array methods (map, filter, reduce) instead of loops',
                  'Consider immutable data patterns',
                  'Pure functions would improve testability',
                  'Use function composition for better modularity'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const imperativeCode = `
        function processUsers(users) {
          const result = [];
          for (let i = 0; i < users.length; i++) {
            if (users[i].active) {
              const user = users[i];
              user.fullName = user.firstName + ' ' + user.lastName;
              result.push(user);
            }
          }
          return result;
        }
        
        function updateCounter() {
          globalCounter++; // Side effect
          return globalCounter;
        }
      `;

      const result = await client.analyzeCode(imperativeCode);
      
      expect(result.refactoringSuggestions).toContain('Use array methods (map, filter, reduce) instead of loops');
      expect(result.refactoringSuggestions).toContain('Pure functions would improve testability');
    });
  });

  describe('Architecture and Scalability Improvements', () => {
    it('should suggest modularization improvements', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Break monolithic code into smaller modules',
                  'Use module exports for better encapsulation',
                  'Consider implementing layers (controller, service, repository)',
                  'Extract utilities into separate modules'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const monolithicCode = `
        // Everything in one file
        const express = require('express');
        const mysql = require('mysql');
        const bcrypt = require('bcrypt');
        
        const connection = mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: 'password',
          database: 'myapp'
        });
        
        const app = express();
        
        app.post('/register', (req, res) => {
          const { email, password } = req.body;
          const hashedPassword = bcrypt.hashSync(password, 10);
          
          connection.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword],
            (err, results) => {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ success: true });
            }
          );
        });
        
        app.get('/users', (req, res) => {
          connection.query('SELECT * FROM users', (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
          });
        });
      `;

      const result = await client.analyzeCode(monolithicCode);
      
      expect(result.refactoringSuggestions).toContain('Break monolithic code into smaller modules');
      expect(result.refactoringSuggestions).toContain('Consider implementing layers (controller, service, repository)');
    });

    it('should suggest configuration and environment improvements', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Move configuration to environment variables',
                  'Use configuration management system',
                  'Implement different configs for different environments',
                  'Add validation for configuration values'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const hardcodedConfigCode = `
        const config = {
          database: {
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'secret123'
          },
          api: {
            baseUrl: 'https://api.example.com',
            timeout: 5000
          },
          features: {
            enableDebug: true
          }
        };
      `;

      const result = await client.analyzeCode(hardcodedConfigCode);
      
      expect(result.refactoringSuggestions).toContain('Move configuration to environment variables');
      expect(result.refactoringSuggestions).toContain('Implement different configs for different environments');
    });

    it('should suggest testing and maintainability improvements', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [],
                refactoringSuggestions: [
                  'Add unit tests for better code coverage',
                  'Extract dependencies for easier mocking',
                  'Use dependency injection for testability',
                  'Add JSDoc comments for better documentation',
                  'Consider using linting tools for consistency'
                ]
              })
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const untestableCode = `
        const fs = require('fs');
        const https = require('https');
        
        function processFile(filename) {
          const data = fs.readFileSync(filename, 'utf8'); // Hard to test
          const processed = data.toUpperCase();
          
          https.get('https://api.example.com/validate', (res) => {
            // Callback makes testing difficult
            fs.writeFileSync('output.txt', processed);
          });
        }
      `;

      const result = await client.analyzeCode(untestableCode);
      
      expect(result.refactoringSuggestions).toContain('Extract dependencies for easier mocking');
      expect(result.refactoringSuggestions).toContain('Use dependency injection for testability');
    });
  });
});
