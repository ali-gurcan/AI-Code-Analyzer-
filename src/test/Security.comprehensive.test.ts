import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiClient } from '../classes/GeminiClient';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Security-Focused Analysis Tests', () => {
  let client: GeminiClient;
  const validApiKey = 'test-api-key-123';

  beforeEach(() => {
    vi.clearAllMocks();
    client = new GeminiClient(validApiKey);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('SQL Injection Detection', () => {
    it('should detect basic SQL injection vulnerabilities', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'SQL injection vulnerability: User input directly concatenated to SQL query',
                  'Unvalidated user input in database query'
                ],
                refactoringSuggestions: [
                  'Use parameterized queries or prepared statements',
                  'Validate and sanitize all user inputs'
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

      const sqlInjectionCode = `
        const userId = req.params.id;
        const query = "SELECT * FROM users WHERE id = " + userId;
        db.query(query, (err, results) => {
          res.json(results);
        });
      `;

      const result = await client.analyzeCode(sqlInjectionCode);
      
      expect(result.securityVulnerabilities).toContain('SQL injection vulnerability: User input directly concatenated to SQL query');
      expect(result.refactoringSuggestions).toContain('Use parameterized queries or prepared statements');
    });

    it('should detect complex SQL injection patterns', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'SQL injection in ORDER BY clause',
                  'Dynamic query construction with user input',
                  'No input validation or escaping'
                ],
                refactoringSuggestions: [
                  'Use whitelist validation for ORDER BY parameters',
                  'Implement proper input sanitization',
                  'Consider using ORM with built-in protection'
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

      const complexSqlCode = `
        function getUsers(sortBy, order) {
          const query = \`SELECT * FROM users ORDER BY \${sortBy} \${order}\`;
          return db.query(query);
        }
        
        app.get('/users', (req, res) => {
          const users = getUsers(req.query.sort, req.query.order);
          res.json(users);
        });
      `;

      const result = await client.analyzeCode(complexSqlCode);
      
      expect(result.securityVulnerabilities).toContain('SQL injection in ORDER BY clause');
      expect(result.securityVulnerabilities).toContain('Dynamic query construction with user input');
    });
  });

  describe('XSS Vulnerability Detection', () => {
    it('should detect reflected XSS vulnerabilities', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'Reflected XSS: User input directly rendered without encoding',
                  'Unescaped HTML content from user input'
                ],
                refactoringSuggestions: [
                  'Use HTML encoding/escaping for user input',
                  'Implement Content Security Policy (CSP)',
                  'Use secure templating engine with auto-escaping'
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

      const xssCode = `
        app.get('/search', (req, res) => {
          const searchTerm = req.query.q;
          const html = \`<h1>Search results for: \${searchTerm}</h1>\`;
          res.send(html);
        });
      `;

      const result = await client.analyzeCode(xssCode);
      
      expect(result.securityVulnerabilities).toContain('Reflected XSS: User input directly rendered without encoding');
      expect(result.refactoringSuggestions).toContain('Use HTML encoding/escaping for user input');
    });

    it('should detect stored XSS vulnerabilities', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'Stored XSS: User input stored and displayed without sanitization',
                  'Dangerous innerHTML usage with user content'
                ],
                refactoringSuggestions: [
                  'Sanitize user input before storage',
                  'Use textContent instead of innerHTML',
                  'Implement server-side HTML sanitization'
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

      const storedXssCode = `
        // Storing user comment
        app.post('/comment', (req, res) => {
          const comment = req.body.comment;
          db.insert('comments', { text: comment, user_id: req.user.id });
        });
        
        // Displaying comments
        app.get('/comments', (req, res) => {
          const comments = db.select('comments');
          comments.forEach(comment => {
            document.getElementById('comments').innerHTML += \`<div>\${comment.text}</div>\`;
          });
        });
      `;

      const result = await client.analyzeCode(storedXssCode);
      
      expect(result.securityVulnerabilities).toContain('Stored XSS: User input stored and displayed without sanitization');
      expect(result.refactoringSuggestions).toContain('Use textContent instead of innerHTML');
    });
  });

  describe('Authentication and Authorization Issues', () => {
    it('should detect weak authentication patterns', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'Weak password validation: No complexity requirements',
                  'Plain text password comparison',
                  'Hardcoded credentials detected'
                ],
                refactoringSuggestions: [
                  'Implement strong password policies',
                  'Use bcrypt or similar for password hashing',
                  'Remove hardcoded credentials, use environment variables'
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

      const weakAuthCode = `
        function login(username, password) {
          if (username === "admin" && password === "123456") {
            return { success: true, token: "admin-token" };
          }
          return { success: false };
        }
        
        function validatePassword(password) {
          return password.length >= 6; // Too weak
        }
      `;

      const result = await client.analyzeCode(weakAuthCode);
      
      expect(result.securityVulnerabilities).toContain('Hardcoded credentials detected');
      expect(result.securityVulnerabilities).toContain('Weak password validation: No complexity requirements');
      expect(result.refactoringSuggestions).toContain('Use bcrypt or similar for password hashing');
    });

    it('should detect missing authorization checks', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'Missing authorization check for sensitive operation',
                  'Direct object reference without access control',
                  'Privilege escalation possible'
                ],
                refactoringSuggestions: [
                  'Implement proper authorization middleware',
                  'Validate user permissions before operations',
                  'Use role-based access control (RBAC)'
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

      const authorizationCode = `
        app.delete('/user/:id', (req, res) => {
          const userId = req.params.id;
          // No authorization check!
          db.delete('users', { id: userId });
          res.json({ success: true });
        });
        
        app.get('/admin/users', (req, res) => {
          // No admin role check!
          const users = db.select('users');
          res.json(users);
        });
      `;

      const result = await client.analyzeCode(authorizationCode);
      
      expect(result.securityVulnerabilities).toContain('Missing authorization check for sensitive operation');
      expect(result.refactoringSuggestions).toContain('Implement proper authorization middleware');
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should detect missing input validation', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'No input validation on user data',
                  'Potential for data injection attacks',
                  'Missing type checking and bounds validation'
                ],
                refactoringSuggestions: [
                  'Implement comprehensive input validation',
                  'Use validation libraries like Joi or Yup',
                  'Sanitize inputs before processing'
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

      const noValidationCode = `
        app.post('/user', (req, res) => {
          const userData = req.body;
          // No validation!
          db.insert('users', userData);
          res.json({ success: true });
        });
        
        function processAge(age) {
          // No type or range checking
          return age * 365; // Could fail with non-numbers
        }
      `;

      const result = await client.analyzeCode(noValidationCode);
      
      expect(result.securityVulnerabilities).toContain('No input validation on user data');
      expect(result.refactoringSuggestions).toContain('Implement comprehensive input validation');
    });

    it('should detect file upload vulnerabilities', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'Unrestricted file upload vulnerability',
                  'No file type validation',
                  'No file size limits',
                  'Potential for executable file uploads'
                ],
                refactoringSuggestions: [
                  'Implement file type whitelist validation',
                  'Set maximum file size limits',
                  'Store uploads outside web root',
                  'Scan uploads for malware'
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

      const fileUploadCode = `
        app.post('/upload', upload.single('file'), (req, res) => {
          const file = req.file;
          // No validation!
          fs.writeFileSync('./uploads/' + file.originalname, file.buffer);
          res.json({ success: true });
        });
      `;

      const result = await client.analyzeCode(fileUploadCode);
      
      expect(result.securityVulnerabilities).toContain('Unrestricted file upload vulnerability');
      expect(result.refactoringSuggestions).toContain('Implement file type whitelist validation');
    });
  });

  describe('Cryptographic Issues', () => {
    it('should detect weak cryptographic practices', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'Use of deprecated MD5 hashing algorithm',
                  'Weak encryption key size',
                  'Predictable random number generation'
                ],
                refactoringSuggestions: [
                  'Use SHA-256 or stronger hashing algorithms',
                  'Implement proper key management',
                  'Use cryptographically secure random generators'
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

      const weakCryptoCode = `
        const crypto = require('crypto');
        
        function hashPassword(password) {
          return crypto.createHash('md5').update(password).digest('hex');
        }
        
        function generateToken() {
          return Math.random().toString(36); // Weak randomness
        }
        
        const encryptionKey = "1234567890123456"; // Weak key
      `;

      const result = await client.analyzeCode(weakCryptoCode);
      
      expect(result.securityVulnerabilities).toContain('Use of deprecated MD5 hashing algorithm');
      expect(result.refactoringSuggestions).toContain('Use SHA-256 or stronger hashing algorithms');
    });

    it('should detect insecure session management', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'Session tokens not properly randomized',
                  'No session expiration implemented',
                  'Sessions not invalidated on logout'
                ],
                refactoringSuggestions: [
                  'Use secure session libraries',
                  'Implement session timeouts',
                  'Properly destroy sessions on logout'
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

      const sessionCode = `
        const sessions = {};
        
        function createSession(userId) {
          const sessionId = userId + "_" + Date.now(); // Predictable
          sessions[sessionId] = { userId, created: Date.now() };
          return sessionId;
        }
        
        function logout(sessionId) {
          // Session not properly destroyed
          sessions[sessionId] = null;
        }
      `;

      const result = await client.analyzeCode(sessionCode);
      
      expect(result.securityVulnerabilities).toContain('Session tokens not properly randomized');
      expect(result.refactoringSuggestions).toContain('Use secure session libraries');
    });
  });

  describe('Information Disclosure', () => {
    it('should detect information leakage in error messages', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'Database error messages exposed to users',
                  'Stack traces leaked in production',
                  'Internal system information disclosed'
                ],
                refactoringSuggestions: [
                  'Implement generic error messages for users',
                  'Log detailed errors server-side only',
                  'Use error handling middleware'
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

      const infoLeakCode = `
        app.get('/user/:id', (req, res) => {
          try {
            const user = db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
            res.json(user);
          } catch (error) {
            // Exposing database errors!
            res.status(500).json({ error: error.message, stack: error.stack });
          }
        });
      `;

      const result = await client.analyzeCode(infoLeakCode);
      
      expect(result.securityVulnerabilities).toContain('Stack traces leaked in production');
      expect(result.refactoringSuggestions).toContain('Implement generic error messages for users');
    });

    it('should detect sensitive data in logs', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'Sensitive data logged in plain text',
                  'Password information in log files',
                  'Personal information exposed in logs'
                ],
                refactoringSuggestions: [
                  'Implement log sanitization',
                  'Never log passwords or sensitive data',
                  'Use structured logging with data masking'
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

      const sensitiveLoggingCode = `
        function loginUser(email, password) {
          console.log('Login attempt:', { email, password }); // Dangerous!
          
          const user = authenticate(email, password);
          if (user) {
            console.log('User logged in:', user); // May contain sensitive data
            return user;
          }
          return null;
        }
      `;

      const result = await client.analyzeCode(sensitiveLoggingCode);
      
      expect(result.securityVulnerabilities).toContain('Password information in log files');
      expect(result.refactoringSuggestions).toContain('Never log passwords or sensitive data');
    });
  });

  describe('CSRF and Security Headers', () => {
    it('should detect missing CSRF protection', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'No CSRF protection on state-changing operations',
                  'Missing CSRF tokens in forms',
                  'Vulnerable to cross-site request forgery'
                ],
                refactoringSuggestions: [
                  'Implement CSRF tokens for all forms',
                  'Use SameSite cookie attributes',
                  'Add CSRF middleware protection'
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

      const csrfCode = `
        app.post('/transfer-money', (req, res) => {
          const { amount, toAccount } = req.body;
          // No CSRF protection!
          transferMoney(req.user.id, toAccount, amount);
          res.json({ success: true });
        });
      `;

      const result = await client.analyzeCode(csrfCode);
      
      expect(result.securityVulnerabilities).toContain('No CSRF protection on state-changing operations');
      expect(result.refactoringSuggestions).toContain('Implement CSRF tokens for all forms');
    });

    it('should detect missing security headers', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                errors: [],
                securityVulnerabilities: [
                  'Missing Content Security Policy header',
                  'No X-Frame-Options protection',
                  'HTTPS not enforced'
                ],
                refactoringSuggestions: [
                  'Implement Content Security Policy',
                  'Add security headers middleware',
                  'Use HTTPS Strict Transport Security'
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

      const securityHeadersCode = `
        const express = require('express');
        const app = express();
        
        // No security headers!
        app.get('/', (req, res) => {
          res.send('<html><body>Hello World</body></html>');
        });
        
        app.listen(3000); // HTTP only, no HTTPS
      `;

      const result = await client.analyzeCode(securityHeadersCode);
      
      expect(result.securityVulnerabilities).toContain('Missing Content Security Policy header');
      expect(result.refactoringSuggestions).toContain('Implement Content Security Policy');
    });
  });
});
