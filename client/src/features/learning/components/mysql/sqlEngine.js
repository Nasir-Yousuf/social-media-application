/**
 * Safe In-Browser SQL Simulator & Execution Engine
 * Evaluates standard SQL queries against in-memory JavaScript relational tables.
 * 100% Client-Side: Zero backend exposure, completely isolated and safe.
 */

import { SAMPLE_DATABASES } from '../../data/mysqlCurriculum/sampleDatabases';

export class SqlEngine {
  constructor(initialDatabaseKey = 'university') {
    this.currentDbKey = initialDatabaseKey;
    this.databases = JSON.parse(JSON.stringify(SAMPLE_DATABASES));
  }

  resetDatabase(dbKey) {
    const key = dbKey || this.currentDbKey;
    if (SAMPLE_DATABASES[key]) {
      this.databases[key] = JSON.parse(JSON.stringify(SAMPLE_DATABASES[key]));
    }
    return { success: true, message: `Database "${this.databases[key]?.name || key}" has been reset to original factory state.` };
  }

  setDatabase(dbKey) {
    if (!this.databases[dbKey]) {
      throw new Error(`Unknown database: ${dbKey}`);
    }
    this.currentDbKey = dbKey;
    return this.databases[dbKey];
  }

  getCurrentDatabase() {
    return this.databases[this.currentDbKey] || this.databases.university;
  }

  getSchema(dbKey) {
    const db = this.databases[dbKey || this.currentDbKey];
    if (!db) return [];
    return Object.keys(db.tables).map((tName) => {
      const tbl = db.tables[tName];
      return {
        tableName: tName,
        columns: tbl.columns.map((c, i) => ({
          name: c,
          type: tbl.types?.[i] || 'VARCHAR(50)',
        })),
        rowCount: tbl.rows.length,
      };
    });
  }

  /**
   * Execute arbitrary SQL string
   */
  execute(sqlQuery) {
    const startTime = performance.now();
    const cleanSql = (sqlQuery || '').trim().replace(/;+$/, '').trim();

    if (!cleanSql) {
      return {
        success: false,
        error: 'Empty query submitted. Please type a valid SQL command.',
        executionTimeMs: 0,
      };
    }

    try {
      const upper = cleanSql.toUpperCase();

      // USE database
      if (upper.startsWith('USE ')) {
        const parts = cleanSql.split(/\s+/);
        const dbName = parts[1]?.toLowerCase();
        const foundKey = Object.keys(this.databases).find(
          (k) => this.databases[k].name === dbName || k === dbName
        );
        if (foundKey) {
          this.currentDbKey = foundKey;
          return {
            success: true,
            message: `Database changed to '${this.databases[foundKey].name}'.`,
            columns: ['status'],
            rows: [{ status: `Database changed to '${this.databases[foundKey].name}'` }],
            rowCount: 0,
            executionTimeMs: Math.round(performance.now() - startTime),
          };
        }
        return {
          success: false,
          error: `ERROR 1049 (42000): Unknown database '${parts[1]}'`,
          executionTimeMs: Math.round(performance.now() - startTime),
        };
      }

      // SHOW TABLES
      if (upper === 'SHOW TABLES' || upper === 'SHOW TABLES;') {
        const db = this.getCurrentDatabase();
        const colName = `Tables_in_${db.name}`;
        const rows = Object.keys(db.tables).map((t) => ({ [colName]: t }));
        return {
          success: true,
          columns: [colName],
          rows,
          rowCount: rows.length,
          executionTimeMs: Math.round(performance.now() - startTime),
        };
      }

      // SHOW DATABASES
      if (upper === 'SHOW DATABASES' || upper === 'SHOW DATABASES;') {
        const rows = Object.keys(this.databases).map((k) => ({ Database: this.databases[k].name }));
        return {
          success: true,
          columns: ['Database'],
          rows,
          rowCount: rows.length,
          executionTimeMs: Math.round(performance.now() - startTime),
        };
      }

      // DESCRIBE / DESC table
      if (upper.startsWith('DESCRIBE ') || upper.startsWith('DESC ')) {
        const parts = cleanSql.split(/\s+/);
        const tableName = parts[1]?.toLowerCase();
        const db = this.getCurrentDatabase();
        const tbl = db.tables[tableName];
        if (!tbl) {
          return {
            success: false,
            error: `ERROR 1146 (42S02): Table '${db.name}.${parts[1]}' doesn't exist`,
            executionTimeMs: Math.round(performance.now() - startTime),
          };
        }
        const columns = ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'];
        const rows = tbl.columns.map((col, idx) => {
          const typeStr = tbl.types?.[idx] || 'VARCHAR(50)';
          const isPri = typeStr.includes('PRIMARY KEY');
          return {
            Field: col,
            Type: typeStr.replace(' PRIMARY KEY', '').replace(' FOREIGN KEY', ''),
            Null: isPri ? 'NO' : 'YES',
            Key: isPri ? 'PRI' : '',
            Default: 'NULL',
            Extra: isPri && col.includes('id') ? 'auto_increment' : '',
          };
        });
        return {
          success: true,
          columns,
          rows,
          rowCount: rows.length,
          executionTimeMs: Math.round(performance.now() - startTime),
        };
      }

      // SELECT
      if (upper.startsWith('SELECT')) {
        return this._executeSelect(cleanSql, startTime);
      }

      // INSERT
      if (upper.startsWith('INSERT INTO')) {
        return this._executeInsert(cleanSql, startTime);
      }

      // UPDATE
      if (upper.startsWith('UPDATE')) {
        return this._executeUpdate(cleanSql, startTime);
      }

      // DELETE
      if (upper.startsWith('DELETE FROM') || upper.startsWith('DELETE')) {
        return this._executeDelete(cleanSql, startTime);
      }

      // CREATE TABLE
      if (upper.startsWith('CREATE TABLE')) {
        return this._executeCreateTable(cleanSql, startTime);
      }

      // DROP TABLE / TRUNCATE
      if (upper.startsWith('DROP TABLE') || upper.startsWith('TRUNCATE TABLE') || upper.startsWith('TRUNCATE')) {
        return this._executeDropOrTruncate(cleanSql, startTime);
      }

      // Unrecognized statement fallback with helpful feedback
      return {
        success: false,
        error: `ERROR 1064 (42000): You have an error in your SQL syntax near '${cleanSql.slice(0, 30)}...'`,
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    } catch (err) {
      return {
        success: false,
        error: `ERROR: ${err.message}`,
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }
  }

  _executeSelect(sql, startTime) {
    const db = this.getCurrentDatabase();

    // Split clauses using regex matching top-level keywords
    // SELECT ... FROM ... [JOIN ...] [WHERE ...] [GROUP BY ...] [HAVING ...] [ORDER BY ...] [LIMIT ...]
    const fromMatch = sql.match(/\sFROM\s/i);
    if (!fromMatch) {
      // E.g. SELECT 10 + 20, SELECT NOW(), SELECT VERSION()
      const selectPart = sql.replace(/^SELECT\s+/i, '').trim();
      return this._evaluateScalarSelect(selectPart, startTime);
    }

    const selectPart = sql.substring(0, fromMatch.index).replace(/^SELECT\s+/i, '').trim();
    let rest = sql.substring(fromMatch.index + fromMatch[0].length).trim();

    // Check for LIMIT
    let limitCount = null;
    let limitOffset = 0;
    const limitMatch = rest.match(/\sLIMIT\s+(\d+)(?:\s*,\s*(\d+)|\s+OFFSET\s+(\d+))?/i);
    if (limitMatch) {
      if (limitMatch[2]) {
        limitOffset = parseInt(limitMatch[1], 10);
        limitCount = parseInt(limitMatch[2], 10);
      } else if (limitMatch[3]) {
        limitCount = parseInt(limitMatch[1], 10);
        limitOffset = parseInt(limitMatch[3], 10);
      } else {
        limitCount = parseInt(limitMatch[1], 10);
      }
      rest = rest.substring(0, limitMatch.index).trim();
    }

    // Check for ORDER BY
    let orderByClause = null;
    const orderMatch = rest.match(/\sORDER\s+BY\s+(.+)$/i);
    if (orderMatch) {
      orderByClause = orderMatch[1].trim();
      rest = rest.substring(0, orderMatch.index).trim();
    }

    // Check for HAVING
    let havingClause = null;
    const havingMatch = rest.match(/\sHAVING\s+(.+)$/i);
    if (havingMatch) {
      havingClause = havingMatch[1].trim();
      rest = rest.substring(0, havingMatch.index).trim();
    }

    // Check for GROUP BY
    let groupByClause = null;
    const groupMatch = rest.match(/\sGROUP\s+BY\s+(.+)$/i);
    if (groupMatch) {
      groupByClause = groupMatch[1].trim();
      rest = rest.substring(0, groupMatch.index).trim();
    }

    // Check for WHERE
    let whereClause = null;
    const whereMatch = rest.match(/\sWHERE\s+(.+)$/i);
    if (whereMatch) {
      whereClause = whereMatch[1].trim();
      rest = rest.substring(0, whereMatch.index).trim();
    }

    // The remaining part is table name and optional JOINs
    const fromAndJoins = rest.trim();
    const sourceRows = this._resolveFromAndJoins(fromAndJoins, db);

    // Apply WHERE
    let filteredRows = sourceRows;
    if (whereClause) {
      filteredRows = filteredRows.filter((row) => this._evaluateCondition(row, whereClause));
    }

    // Apply GROUP BY & Aggregation
    let resultRows = [];
    let isAggregateQuery = this._containsAggregate(selectPart) || Boolean(groupByClause);

    if (isAggregateQuery) {
      resultRows = this._executeGroupByAndAggregation(filteredRows, selectPart, groupByClause, havingClause);
    } else {
      // Normal project
      const distinct = /^DISTINCT\s+/i.test(selectPart);
      const cleanSelect = selectPart.replace(/^DISTINCT\s+/i, '').trim();

      resultRows = filteredRows.map((row) => this._projectRow(row, cleanSelect));

      if (distinct) {
        const seen = new Set();
        resultRows = resultRows.filter((r) => {
          const key = JSON.stringify(r);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
    }

    // Apply ORDER BY
    if (orderByClause && resultRows.length > 0) {
      resultRows = this._applyOrderBy(resultRows, orderByClause);
    }

    // Apply LIMIT
    if (limitCount !== null) {
      resultRows = resultRows.slice(limitOffset, limitOffset + limitCount);
    }

    // Format output columns
    const columns = resultRows.length > 0 ? Object.keys(resultRows[0]) : this._extractProjectedColumnNames(selectPart);

    return {
      success: true,
      columns,
      rows: resultRows,
      rowCount: resultRows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    };
  }

  _evaluateScalarSelect(selectPart, startTime) {
    const cols = selectPart.split(',').map((c) => c.trim());
    const row = {};
    const columns = [];
    cols.forEach((col, idx) => {
      let alias = `col_${idx + 1}`;
      let expr = col;
      const asMatch = col.match(/(.+?)\s+AS\s+(.+)/i);
      if (asMatch) {
        expr = asMatch[1].trim();
        alias = asMatch[2].trim().replace(/['"`]/g, '');
      } else {
        alias = col.replace(/['"`]/g, '');
      }
      columns.push(alias);

      if (/^NOW\(\)/i.test(expr)) {
        row[alias] = new Date().toISOString().replace('T', ' ').substring(0, 19);
      } else if (/^VERSION\(\)/i.test(expr)) {
        row[alias] = '8.0.36-MySQL Community Server (Clearfeed Practice Lab)';
      } else if (/^DATABASE\(\)/i.test(expr)) {
        row[alias] = this.getCurrentDatabase().name;
      } else {
        try {
          // evaluate math
          const sanitized = expr.replace(/[^0-9+\-*/(). ]/g, '');
          // eslint-disable-next-line no-eval
          row[alias] = sanitized ? Function(`'use strict'; return (${sanitized})`)() : expr.replace(/['"`]/g, '');
        } catch {
          row[alias] = expr.replace(/['"`]/g, '');
        }
      }
    });

    return {
      success: true,
      columns,
      rows: [row],
      rowCount: 1,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    };
  }

  _resolveFromAndJoins(fromClause, db) {
    // Check for JOIN keywords
    const joinRegex = /\s+(INNER|LEFT|RIGHT|CROSS)?\s*JOIN\s+/i;
    if (!joinRegex.test(fromClause)) {
      // Single table: e.g. "students" or "students AS s" or "students s"
      const parts = fromClause.split(/\s+(?:AS\s+)?/i);
      const tableName = parts[0].trim().toLowerCase();
      const alias = parts[1]?.trim();

      const tbl = db.tables[tableName];
      if (!tbl) {
        throw new Error(`Table '${db.name}.${parts[0]}' doesn't exist.`);
      }

      return tbl.rows.map((row) => {
        const enriched = { ...row };
        // also store prefixed columns if alias or tableName provided
        Object.keys(row).forEach((col) => {
          enriched[`${tableName}.${col}`] = row[col];
          if (alias) enriched[`${alias}.${col}`] = row[col];
        });
        return enriched;
      });
    }

    // Handles table1 JOIN table2 ON table1.col = table2.col
    const tokens = fromClause.split(/\s+(INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|CROSS\s+JOIN|JOIN)\s+/i);
    let baseTableDef = tokens[0].trim();
    let currentRows = this._resolveSingleTable(baseTableDef, db);

    for (let i = 1; i < tokens.length; i += 2) {
      const joinType = tokens[i].toUpperCase();
      const rest = tokens[i + 1].trim();
      const onParts = rest.split(/\s+ON\s+/i);
      const joinTableDef = onParts[0].trim();
      const onCondition = onParts[1]?.trim();

      const rightRows = this._resolveSingleTable(joinTableDef, db);

      if (joinType.includes('CROSS')) {
        const cross = [];
        currentRows.forEach((r1) => {
          rightRows.forEach((r2) => {
            cross.push({ ...r1, ...r2 });
          });
        });
        currentRows = cross;
      } else {
        const joined = [];
        const isLeft = joinType.includes('LEFT');
        const isRight = joinType.includes('RIGHT');

        currentRows.forEach((r1) => {
          let matched = false;
          rightRows.forEach((r2) => {
            const candidate = { ...r1, ...r2 };
            if (this._evaluateCondition(candidate, onCondition)) {
              joined.push(candidate);
              matched = true;
            }
          });
          if (!matched && isLeft) {
            // Fill right side with nulls
            const nullRow = {};
            if (rightRows.length > 0) {
              Object.keys(rightRows[0]).forEach((k) => { nullRow[k] = null; });
            }
            joined.push({ ...r1, ...nullRow });
          }
        });

        if (isRight) {
          rightRows.forEach((r2) => {
            let matched = false;
            currentRows.forEach((r1) => {
              const candidate = { ...r1, ...r2 };
              if (this._evaluateCondition(candidate, onCondition)) {
                matched = true;
              }
            });
            if (!matched) {
              const nullRow = {};
              if (currentRows.length > 0) {
                Object.keys(currentRows[0]).forEach((k) => { nullRow[k] = null; });
              }
              joined.push({ ...nullRow, ...r2 });
            }
          });
        }

        currentRows = joined;
      }
    }

    return currentRows;
  }

  _resolveSingleTable(tableDef, db) {
    const parts = tableDef.split(/\s+(?:AS\s+)?/i);
    const tableName = parts[0].trim().toLowerCase();
    const alias = parts[1]?.trim();

    const tbl = db.tables[tableName];
    if (!tbl) {
      throw new Error(`Table '${db.name}.${parts[0]}' doesn't exist.`);
    }

    return tbl.rows.map((row) => {
      const enriched = { ...row };
      Object.keys(row).forEach((col) => {
        enriched[`${tableName}.${col}`] = row[col];
        if (alias) enriched[`${alias}.${col}`] = row[col];
      });
      return enriched;
    });
  }

  _evaluateCondition(row, conditionStr) {
    if (!conditionStr || conditionStr.trim() === '1=1') return true;
    let cond = conditionStr.trim();

    // Support OR
    if (/\s+OR\s+/i.test(cond)) {
      const orParts = cond.split(/\s+OR\s+/i);
      return orParts.some((part) => this._evaluateCondition(row, part));
    }

    // Support AND
    if (/\s+AND\s+/i.test(cond)) {
      const andParts = cond.split(/\s+AND\s+/i);
      return andParts.every((part) => this._evaluateCondition(row, part));
    }

    // NOT
    if (/^NOT\s+/i.test(cond)) {
      return !this._evaluateCondition(row, cond.replace(/^NOT\s+/i, ''));
    }

    // IS NULL / IS NOT NULL
    const isNotNullMatch = cond.match(/^(.+?)\s+IS\s+NOT\s+NULL$/i);
    if (isNotNullMatch) {
      const val = this._resolveVal(row, isNotNullMatch[1]);
      return val !== null && val !== undefined;
    }
    const isNullMatch = cond.match(/^(.+?)\s+IS\s+NULL$/i);
    if (isNullMatch) {
      const val = this._resolveVal(row, isNullMatch[1]);
      return val === null || val === undefined;
    }

    // LIKE
    const likeMatch = cond.match(/^(.+?)\s+LIKE\s+['"](.+?)['"]$/i);
    if (likeMatch) {
      const leftVal = String(this._resolveVal(row, likeMatch[1]) ?? '').toLowerCase();
      const pattern = likeMatch[2].toLowerCase().replace(/%/g, '.*').replace(/_/g, '.');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(leftVal);
    }

    // IN (...)
    const inMatch = cond.match(/^(.+?)\s+IN\s*\((.+?)\)$/i);
    if (inMatch) {
      const leftVal = this._resolveVal(row, inMatch[1]);
      const list = inMatch[2].split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, ''));
      return list.includes(String(leftVal));
    }

    // BETWEEN a AND b
    const betweenMatch = cond.match(/^(.+?)\s+BETWEEN\s+(.+?)\s+AND\s+(.+)$/i);
    if (betweenMatch) {
      const val = Number(this._resolveVal(row, betweenMatch[1]));
      const min = Number(betweenMatch[2].replace(/['"]/g, ''));
      const max = Number(betweenMatch[3].replace(/['"]/g, ''));
      return val >= min && val <= max;
    }

    // Standard comparison operators: !=, <>, >=, <=, =, >, <
    const compRegex = /(.+?)\s*(!=|<=|>=|<>|=|<|>)\s*(.+)/;
    const match = cond.match(compRegex);
    if (match) {
      const left = this._resolveVal(row, match[1]);
      const op = match[2];
      const right = this._resolveVal(row, match[3]);

      // Normalize types
      const numL = Number(left);
      const numR = Number(right);
      const isNum = !isNaN(numL) && !isNaN(numR) && left !== '' && right !== '';

      const vL = isNum ? numL : String(left ?? '').toLowerCase();
      const vR = isNum ? numR : String(right ?? '').toLowerCase();

      switch (op) {
        case '=':
          return vL === vR;
        case '!=':
        case '<>':
          return vL !== vR;
        case '>':
          return vL > vR;
        case '<':
          return vL < vR;
        case '>=':
          return vL >= vR;
        case '<=':
          return vL <= vR;
        default:
          return false;
      }
    }

    return true;
  }

  _resolveVal(row, expr) {
    if (!expr) return null;
    const clean = expr.trim();

    // Literal string
    if ((clean.startsWith("'") && clean.endsWith("'")) || (clean.startsWith('"') && clean.endsWith('"'))) {
      return clean.slice(1, -1);
    }

    // Literal number
    if (!isNaN(Number(clean)) && clean !== '') {
      return Number(clean);
    }

    // Column lookup (direct or table.col)
    if (clean in row) {
      return row[clean];
    }

    const lower = clean.toLowerCase();
    for (const k of Object.keys(row)) {
      if (k.toLowerCase() === lower || k.toLowerCase().endsWith(`.${lower}`)) {
        return row[k];
      }
    }

    return clean;
  }

  _containsAggregate(selectPart) {
    return /\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(selectPart);
  }

  _executeGroupByAndAggregation(rows, selectPart, groupByClause, havingClause) {
    const groupCol = groupByClause ? groupByClause.trim() : null;
    const groups = {};

    if (!groupCol) {
      groups['__ALL__'] = rows;
    } else {
      rows.forEach((r) => {
        const val = this._resolveVal(r, groupCol);
        const key = String(val);
        if (!groups[key]) groups[key] = [];
        groups[key].push(r);
      });
    }

    const projectedList = this._parseSelectItems(selectPart);
    let output = [];

    Object.keys(groups).forEach((gKey) => {
      const gRows = groups[gKey];
      const rep = gRows[0] || {};
      const resRow = {};

      projectedList.forEach(({ expr, alias }) => {
        const aggMatch = expr.match(/\b(COUNT|SUM|AVG|MIN|MAX)\s*\((.*?)\)/i);
        if (aggMatch) {
          const fn = aggMatch[1].toUpperCase();
          const target = aggMatch[2].trim();
          let calculated = 0;

          if (fn === 'COUNT') {
            if (target === '*' || target === '1') {
              calculated = gRows.length;
            } else {
              calculated = gRows.filter((r) => this._resolveVal(r, target) !== null).length;
            }
          } else if (fn === 'SUM') {
            calculated = gRows.reduce((acc, r) => acc + (Number(this._resolveVal(r, target)) || 0), 0);
          } else if (fn === 'AVG') {
            const sum = gRows.reduce((acc, r) => acc + (Number(this._resolveVal(r, target)) || 0), 0);
            calculated = gRows.length ? Number((sum / gRows.length).toFixed(2)) : 0;
          } else if (fn === 'MIN') {
            const vals = gRows.map((r) => Number(this._resolveVal(r, target))).filter((v) => !isNaN(v));
            calculated = vals.length ? Math.min(...vals) : null;
          } else if (fn === 'MAX') {
            const vals = gRows.map((r) => Number(this._resolveVal(r, target))).filter((v) => !isNaN(v));
            calculated = vals.length ? Math.max(...vals) : null;
          }
          resRow[alias] = calculated;
        } else {
          // Regular grouped column
          resRow[alias] = this._resolveVal(rep, expr);
        }
      });

      // Filter HAVING if specified
      if (!havingClause || this._evaluateCondition(resRow, havingClause)) {
        output.push(resRow);
      }
    });

    return output;
  }

  _parseSelectItems(selectPart) {
    const items = [];
    const parts = selectPart.split(/,(?![^(]*\))/); // split commas outside parentheses
    parts.forEach((p) => {
      const trimmed = p.trim();
      const asMatch = trimmed.match(/^(.+?)\s+AS\s+([a-zA-Z0-9_`"']+)/i);
      if (asMatch) {
        items.push({
          expr: asMatch[1].trim(),
          alias: asMatch[2].trim().replace(/[`"']/g, ''),
        });
      } else {
        items.push({
          expr: trimmed,
          alias: trimmed.replace(/[`"']/g, ''),
        });
      }
    });
    return items;
  }

  _projectRow(row, selectPart) {
    if (selectPart === '*') {
      // return clean row without dot prefixes
      const clean = {};
      Object.keys(row).forEach((k) => {
        if (!k.includes('.')) clean[k] = row[k];
      });
      return Object.keys(clean).length > 0 ? clean : row;
    }

    const items = this._parseSelectItems(selectPart);
    const result = {};
    items.forEach(({ expr, alias }) => {
      if (expr === '*') {
        Object.keys(row).forEach((k) => {
          if (!k.includes('.')) result[k] = row[k];
        });
      } else {
        result[alias] = this._resolveVal(row, expr);
      }
    });
    return result;
  }

  _applyOrderBy(rows, orderByClause) {
    const parts = orderByClause.split(',').map((p) => p.trim());
    return [...rows].sort((a, b) => {
      for (const p of parts) {
        const isDesc = /\s+DESC$/i.test(p);
        const col = p.replace(/\s+(ASC|DESC)$/i, '').trim().replace(/[`"']/g, '');

        const vA = a[col];
        const vB = b[col];

        if (vA === vB) continue;
        if (vA === null || vA === undefined) return 1;
        if (vB === null || vB === undefined) return -1;

        const numA = Number(vA);
        const numB = Number(vB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return isDesc ? numB - numA : numA - numB;
        }

        const cmp = String(vA).localeCompare(String(vB));
        return isDesc ? -cmp : cmp;
      }
      return 0;
    });
  }

  _extractProjectedColumnNames(selectPart) {
    if (selectPart === '*') return ['*'];
    return this._parseSelectItems(selectPart).map((i) => i.alias);
  }

  _executeInsert(sql, startTime) {
    const match = sql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)(?:\s*\((.+?)\))?\s+VALUES\s*\((.+)\)/i);
    if (!match) {
      throw new Error("Syntax error in INSERT INTO statement. Expected: INSERT INTO table [(col1, ...)] VALUES (val1, ...)");
    }
    const tableName = match[1].toLowerCase();
    const cols = match[2] ? match[2].split(',').map((c) => c.trim().replace(/[`"']/g, '')) : null;
    const vals = match[3].split(',').map((v) => {
      const t = v.trim();
      if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
        return t.slice(1, -1);
      }
      if (!isNaN(Number(t))) return Number(t);
      if (t.toUpperCase() === 'NULL') return null;
      return t;
    });

    const db = this.getCurrentDatabase();
    const tbl = db.tables[tableName];
    if (!tbl) {
      throw new Error(`Table '${db.name}.${match[1]}' doesn't exist.`);
    }

    const newRow = {};
    if (cols) {
      cols.forEach((col, idx) => {
        newRow[col] = vals[idx] !== undefined ? vals[idx] : null;
      });
    } else {
      tbl.columns.forEach((col, idx) => {
        newRow[col] = vals[idx] !== undefined ? vals[idx] : null;
      });
    }

    tbl.rows.push(newRow);

    return {
      success: true,
      message: `Query OK, 1 row affected (${Math.max(1, Math.round(performance.now() - startTime))} ms)`,
      affectedRows: 1,
      columns: ['status'],
      rows: [{ status: 'Query OK, 1 row affected.' }],
      rowCount: 1,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    };
  }

  _executeUpdate(sql, startTime) {
    const match = sql.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
    if (!match) {
      throw new Error("Syntax error in UPDATE statement. Expected: UPDATE table SET col=val [WHERE condition]");
    }
    const tableName = match[1].toLowerCase();
    const setClause = match[2].trim();
    const whereClause = match[3]?.trim();

    const db = this.getCurrentDatabase();
    const tbl = db.tables[tableName];
    if (!tbl) {
      throw new Error(`Table '${db.name}.${match[1]}' doesn't exist.`);
    }

    const setPairs = setClause.split(',').map((p) => {
      const [col, val] = p.split('=').map((s) => s.trim());
      let cleanVal = val;
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        cleanVal = val.slice(1, -1);
      } else if (!isNaN(Number(val))) {
        cleanVal = Number(val);
      }
      return { col: col.replace(/[`"']/g, ''), val: cleanVal };
    });

    let affected = 0;
    tbl.rows.forEach((row) => {
      if (!whereClause || this._evaluateCondition(row, whereClause)) {
        setPairs.forEach(({ col, val }) => {
          row[col] = val;
        });
        affected++;
      }
    });

    return {
      success: true,
      message: `Query OK, ${affected} rows affected (${Math.max(1, Math.round(performance.now() - startTime))} ms)`,
      affectedRows: affected,
      columns: ['status'],
      rows: [{ status: `Query OK, ${affected} rows affected.` }],
      rowCount: 1,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    };
  }

  _executeDelete(sql, startTime) {
    const match = sql.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?$/i);
    if (!match) {
      throw new Error("Syntax error in DELETE statement. Expected: DELETE FROM table [WHERE condition]");
    }
    const tableName = match[1].toLowerCase();
    const whereClause = match[2]?.trim();

    const db = this.getCurrentDatabase();
    const tbl = db.tables[tableName];
    if (!tbl) {
      throw new Error(`Table '${db.name}.${match[1]}' doesn't exist.`);
    }

    const initialLen = tbl.rows.length;
    if (!whereClause) {
      tbl.rows = [];
    } else {
      tbl.rows = tbl.rows.filter((row) => !this._evaluateCondition(row, whereClause));
    }
    const affected = initialLen - tbl.rows.length;

    return {
      success: true,
      message: `Query OK, ${affected} rows affected (${Math.max(1, Math.round(performance.now() - startTime))} ms)`,
      affectedRows: affected,
      columns: ['status'],
      rows: [{ status: `Query OK, ${affected} rows affected.` }],
      rowCount: 1,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    };
  }

  _executeCreateTable(sql, startTime) {
    const match = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\((.+)\)/is);
    if (!match) {
      throw new Error("Syntax error in CREATE TABLE statement.");
    }
    const tableName = match[1].toLowerCase();
    const defs = match[2].split(/,(?![^(]*\))/).map((d) => d.trim());

    const columns = [];
    const types = [];

    defs.forEach((def) => {
      const parts = def.split(/\s+/);
      const colName = parts[0].replace(/[`"']/g, '');
      if (['PRIMARY', 'CONSTRAINT', 'FOREIGN', 'KEY', 'UNIQUE', 'CHECK'].includes(colName.toUpperCase())) {
        return;
      }
      columns.push(colName);
      types.push(parts.slice(1).join(' '));
    });

    const db = this.getCurrentDatabase();
    db.tables[tableName] = {
      name: tableName,
      columns,
      types,
      rows: [],
    };

    return {
      success: true,
      message: `Query OK, 0 rows affected. Table '${tableName}' created.`,
      affectedRows: 0,
      columns: ['status'],
      rows: [{ status: `Table '${tableName}' created successfully.` }],
      rowCount: 1,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    };
  }

  _executeDropOrTruncate(sql, startTime) {
    const db = this.getCurrentDatabase();
    if (/^DROP\s+TABLE/i.test(sql)) {
      const match = sql.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
      if (match) {
        const t = match[1].toLowerCase();
        delete db.tables[t];
        return {
          success: true,
          message: `Query OK, 0 rows affected. Table '${match[1]}' dropped.`,
          columns: ['status'],
          rows: [{ status: `Table '${match[1]}' dropped.` }],
          rowCount: 1,
          executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
        };
      }
    } else {
      const match = sql.match(/TRUNCATE\s+(?:TABLE\s+)?([a-zA-Z0-9_]+)/i);
      if (match) {
        const t = match[1].toLowerCase();
        if (db.tables[t]) db.tables[t].rows = [];
        return {
          success: true,
          message: `Query OK, 0 rows affected. Table '${match[1]}' truncated.`,
          columns: ['status'],
          rows: [{ status: `Table '${match[1]}' truncated.` }],
          rowCount: 1,
          executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
        };
      }
    }
    throw new Error('Invalid DROP/TRUNCATE statement.');
  }
}

export const defaultSqlEngine = new SqlEngine('ecommerce');

export const executeQuery = (sql, dbNameOrKey = 'ecommerce') => {
  const key = (dbNameOrKey || '').replace('_db', '');
  if (defaultSqlEngine.databases[key]) {
    defaultSqlEngine.setDatabase(key);
  }
  return defaultSqlEngine.execute(sql);
};

export const executeMultipleQueries = (sql, dbNameOrKey = 'ecommerce') => {
  const key = (dbNameOrKey || '').replace('_db', '');
  if (defaultSqlEngine.databases[key]) {
    defaultSqlEngine.setDatabase(key);
  }
  return defaultSqlEngine.execute(sql);
};

export const resetDatabase = (dbNameOrKey) => {
  const key = dbNameOrKey ? dbNameOrKey.replace('_db', '') : null;
  return defaultSqlEngine.resetDatabase(key);
};

export const getDatabaseSchema = (dbNameOrKey = 'ecommerce') => {
  const key = (dbNameOrKey || '').replace('_db', '');
  const db = defaultSqlEngine.databases[key] || defaultSqlEngine.getCurrentDatabase();
  const schemaMap = {};
  if (db && db.tables) {
    Object.keys(db.tables).forEach(t => {
      schemaMap[t] = {
        columns: db.tables[t].columns,
        rowCount: db.tables[t].rows.length,
      };
    });
  }
  return schemaMap;
};

export const getDatabaseNames = () => {
  return ['ecommerce_db', 'university_db', 'company_db'];
};

export default SqlEngine;
