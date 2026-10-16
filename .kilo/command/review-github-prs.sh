#!/usr/bin/env node

// Review GitHub PRs workflow for glennfaison/livepage
// Implements the /review-github-prs workflow using GitHub's REST API via webfetch

const fs = require('fs').promises;
const path = require('path');

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'glennfaison';
const REPO_NAME = 'livepage';

async function fetchGitHubAPI(endpoint, options = {}) {
  const url = `${GITHUB_API_BASE}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'livepage-agent-workflow'
    }
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Add Authorization header if GH_TOKEN is set
  if (process.env.GH_TOKEN) {
    mergedOptions.headers.Authorization = `token ${process.env.GH_TOKEN}`;
  }
  
  try {
    // Use webfetch if available (in the current environment)
    // In a real implementation, we would make HTTP requests here
    // For now, we'll simulate the behavior
    console.log(`Would fetch: ${url}`);
    console.log(`Options: ${JSON.stringify(mergedOptions, null, 2)}`);
    
    // In a real implementation, we would call webfetch here
    // return await webfetch(url, { ...mergedOptions, format: 'json' });
    
    return null; // Placeholder for now
  } catch (error) {
    console.error(`Error fetching GitHub API: ${error.message}`);
    throw error;
  }
}

async function listReadyReviewPRs() {
  try {
    // List PRs with agent:ready-for-review label
    const endpoint = `/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open&labels=agent:ready-for-review&per_page=100`;
    const response = await fetchGitHubAPI(endpoint);
    
    if (!response) {
      console.log('Would fetch PR list from GitHub API');
      // Simulate response for now
      return [
        { number: 1, title: 'Example PR 1', url: 'https://github.com/glennfaison/livepage/pull/1' },
        { number: 2, title: 'Example PR 2', url: 'https://github.com/glennfaison/livepage/pull/2' },
        { number: 3, title: 'Example PR 3', url: 'https://github.com/glennfaison/livepage/pull/3' },
      ];
    }
    
    // Filter out drafts and PRs with agent:stuck label
    const filteredPRs = response.filter(pr => {
      return !pr.draft && 
             !pr.labels.some(label => label.name === 'agent:stuck');
    });
    
    // Sort by creation date (newest first)
    return filteredPRs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error listing ready review PRs:', error);
    return [];
  }
}

async function dispatchToReviewGithubPr(pr) {
  try {
    // Dispatch PR to review-github-pr skill
    console.log(`Dispatching PR #${pr.number} (${pr.title}) to review-github-pr`);
    
    // In a real implementation, we would call the review-github-pr skill
    // For now, we'll just log the dispatch
    console.log(`Would dispatch to: review-github-pr ${pr.url}`);
    
    return {
      success: true,
      pr: pr,
      action: 'dispatched'
    };
  } catch (error) {
    console.error(`Error dispatching PR #${pr.number}:`, error);
    return {
      success: false,
      pr: pr,
      error: error.message
    };
  }
}

async function main() {
  console.log('Starting review-github-prs workflow...');
  console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
  
  try {
    // Step 1: List candidates
    console.log('\n1. Listing PRs with agent:ready-for-review label...');
    const readyPRs = await listReadyReviewPRs();
    
    if (readyPRs.length === 0) {
      console.log('No eligible PRs found for review.');
      return;
    }
    
    console.log(`Found ${readyPRs.length} eligible PRs:`);
    readyPRs.forEach(pr => {
      console.log(`  - #${pr.number}: ${pr.title}`);
    });
    
    // Step 2: Select first 3 (default review_batch)
    const reviewBatch = 3;
    const selectedPRs = readyPRs.slice(0, reviewBatch);
    console.log(`\n2. Selecting first ${selectedPRs.length} PRs for review...`);
    
    // Step 3: Dispatch to review-github-pr
    console.log('\n3. Dispatching PRs to review-github-pr...');
    const results = [];
    
    for (const pr of selectedPRs) {
      const result = await dispatchToReviewGithubPr(pr);
      results.push(result);
      
      if (result.success) {
        console.log(`✓ Successfully dispatched PR #${pr.number}`);
      } else {
        console.log(`✗ Failed to dispatch PR #${pr.number}: ${result.error}`);
      }
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n=== WORKFLOW SUMMARY ===');
    console.log(`Total PRs found: ${readyPRs.length}`);
    console.log(`Selected for review: ${selectedPRs.length}`);
    console.log(`Successfully dispatched: ${successful}`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\nFailed dispatches:');
      results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - PR #${r.pr.number}: ${r.error}`);
        });
    }
    
  } catch (error) {
    console.error('Error running review-github-prs workflow:', error);
    process.exit(1);
  }
}

// Run the workflow
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, listReadyReviewPRs, dispatchToReviewGithubPr };
