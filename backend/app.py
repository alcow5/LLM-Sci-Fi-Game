from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import requests
from datetime import datetime
import logging
import re
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama2-uncensored')
USE_LLM_QUESTS = os.getenv('USE_LLM_QUESTS', 'true').lower() == 'true'  # Enable LLM quest generation

# MythoMax-13B context window: ~8,192 tokens (similar to Llama 3)
MAX_CONTEXT_TOKENS = 8192
# Reserve some tokens for response
RESERVED_TOKENS = 1000
MAX_INPUT_TOKENS = MAX_CONTEXT_TOKENS - RESERVED_TOKENS

def estimate_tokens(text):
    """Rough estimation of token count (1 token ≈ 4 characters for English)"""
    if not text:
        return 0
    # Rough estimation: 1 token ≈ 4 characters for English text
    return len(text) // 4

def log_token_usage(prompt, response_tokens=0, context_name="Unknown"):
    """Log token usage for monitoring"""
    input_tokens = estimate_tokens(prompt)
    total_tokens = input_tokens + response_tokens
    
    logger.info(f"=== TOKEN USAGE: {context_name} ===")
    logger.info(f"Input tokens: ~{input_tokens}")
    logger.info(f"Response tokens: {response_tokens}")
    logger.info(f"Total tokens: ~{total_tokens}")
    logger.info(f"Context window: {MAX_CONTEXT_TOKENS} tokens")
    logger.info(f"Usage: {total_tokens}/{MAX_CONTEXT_TOKENS} ({total_tokens/MAX_CONTEXT_TOKENS*100:.1f}%)")
    
    if total_tokens > MAX_INPUT_TOKENS:
        logger.warning(f"⚠️  WARNING: Approaching context limit! Consider reducing prompt size.")
    
    logger.info(f"================================")

# Setup logging
def setup_logging():
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/ollama_interactions.log'),
            logging.StreamHandler()  # Also print to console
        ]
    )
    return logging.getLogger(__name__)

logger = setup_logging()

# Game state storage (in production, use a proper database)
game_state = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'ollama_url': OLLAMA_URL,
        'ollama_model': OLLAMA_MODEL
    })

@app.route('/api/dialogue', methods=['POST'])
def handle_dialogue():
    """Handle NPC dialogue requests and generate LLM responses"""
    try:
        data = request.get_json()
        
        # Extract data from request
        npc_id = data.get('npc_id')
        npc_name = data.get('npc_name')
        npc_personality = data.get('npc_personality')
        npc_role = data.get('npc_role')
        npc_background = data.get('npc_background')
        npc_dialogue_style = data.get('npc_dialogue_style')
        player_message = data.get('player_message', '')
        player_context = data.get('player_context', {})
        memory_context = data.get('memory_context', '')
        
        # Generate LLM response with memory context
        llm_response = generate_llm_dialogue_response(
            npc_name, npc_personality, npc_role, npc_background, 
            npc_dialogue_style, player_message, player_context, memory_context
        )
        
        return jsonify({
            'success': True,
            'message': llm_response,
            'npc_id': npc_id,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': get_fallback_dialogue_response(npc_name)
        }), 500

@app.route('/api/quest', methods=['POST'])
def handle_quest():
    """Handle quest generation requests"""
    try:
        data = request.get_json()
        
        npc_id = data.get('npc_id')
        npc_name = data.get('npc_name')
        npc_personality = data.get('npc_personality')
        npc_role = data.get('npc_role')
        player_context = data.get('player_context', {})
        existing_quests = data.get('existing_quests', [])
        
        # Generate dynamic quest
        quest = generate_dynamic_quest(npc_id, npc_name, npc_personality, npc_role, player_context, existing_quests)
        
        return jsonify({
            'success': True,
            'quest': quest,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'quest': get_fallback_quest(npc_id)
        }), 500

@app.route('/api/save', methods=['POST'])
def save_game():
    """Save game state"""
    try:
        data = request.get_json()
        save_id = f"save_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        game_state[save_id] = {
            'data': data,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'save_id': save_id,
            'message': 'Game saved successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/load', methods=['GET'])
def load_game():
    """Load latest game state"""
    try:
        if not game_state:
            return jsonify({
                'success': False,
                'message': 'No saved game found'
            }), 404
        
        # Get the most recent save
        latest_save_id = max(game_state.keys())
        latest_save = game_state[latest_save_id]
        
        return jsonify({
            'success': True,
            'save_id': latest_save_id,
            'data': latest_save['data'],
            'timestamp': latest_save['timestamp']
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Get recent logs for debugging"""
    try:
        log_file = 'logs/ollama_interactions.log'
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                # Get last 50 lines
                lines = f.readlines()
                recent_logs = lines[-50:] if len(lines) > 50 else lines
                return jsonify({
                    'success': True,
                    'logs': recent_logs,
                    'total_lines': len(lines)
                })
        else:
            return jsonify({
                'success': False,
                'message': 'No log file found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/logs/clear', methods=['POST'])
def clear_logs():
    """Clear the log file"""
    try:
        with open('logs/game_logs.txt', 'w') as f:
            f.write('')
        return jsonify({'success': True, 'message': 'Logs cleared'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/generate-quest', methods=['POST'])
def generate_quest():
    """Generate quests based on conversation context and player suggestions"""
    try:
        data = request.get_json()
        npc_name = data.get('npc_name', 'Unknown NPC')
        conversation_context = data.get('conversation_context', '')
        player_suggestion = data.get('player_suggestion', '')
        available_items = data.get('available_items', [])
        available_npcs = data.get('available_npcs', [])
        
        logger.info(f"=== GENERATE QUEST REQUEST ===")
        logger.info(f"NPC: {npc_name}")
        logger.info(f"Player Suggestion: {player_suggestion}")
        logger.info(f"Available Items: {available_items}")
        logger.info(f"Available NPCs: {available_npcs}")
        logger.info(f"LLM Quests Enabled: {USE_LLM_QUESTS}")
        
        if USE_LLM_QUESTS:
            # Use LLM-powered quest generation
            logger.info("Using LLM-powered quest generation")
            logger.info(f"Available Items Count: {len(available_items)}")
            logger.info(f"Available NPCs Count: {len(available_npcs)}")
            
            # Get NPC data from NPCData
            npc_data = get_npc_data_by_name(npc_name)
            if npc_data:
                quest = generate_dynamic_quest(
                    npc_data['id'], 
                    npc_name, 
                    npc_data['personality'], 
                    npc_data['role'], 
                    {},  # player_context
                    [],  # existing_quests
                    available_items,
                    available_npcs,
                    player_suggestion
                )
            else:
                # Fallback to simple quest generation
                quest = generate_simple_quest(player_suggestion, available_items, available_npcs)
        else:
            # Use simple rule-based quest generation
            logger.info("Using simple rule-based quest generation")
            quest = generate_simple_quest(player_suggestion, available_items, available_npcs)
        
        logger.info(f"=== GENERATE QUEST RESPONSE ===")
        logger.info(f"Generated Quest: {quest}")
        
        return jsonify({'success': True, 'quest': quest})
            
    except Exception as e:
        logger.error(f"Error generating quest: {str(e)}")
        return jsonify({'success': False, 'message': str(e)})

def generate_simple_quest(player_suggestion, available_items, available_npcs):
    """Generate a simple rule-based quest"""
    # Log token usage for simple quest generation (no LLM used)
    log_token_usage(f"Simple quest generation: {player_suggestion}", 0, "Simple Quest Generation")
    
    # Simple quest generation without LLM for now
    if 'collect' in player_suggestion.lower() or 'crystal' in player_suggestion.lower():
        if available_items:
            quest = {
                "quest_type": "collect_item",
                "title": f"Collect {available_items[0]}",
                "description": f"Please collect {available_items[0]} for me.",
                "target_item": available_items[0],
                "quantity": 1,
                "reward_crypto": 15,
                "response": f"That's a great idea! I could really use some {available_items[0]}. Can you collect it for me?"
            }
        else:
            quest = {
                "quest_type": "collect_item",
                "title": "Collect an item",
                "description": "Please collect an item for me.",
                "target_item": "crystal_red",
                "quantity": 1,
                "reward_crypto": 15,
                "response": "That's a great idea! I could really use some help collecting items."
            }
    elif 'talk' in player_suggestion.lower() or 'message' in player_suggestion.lower():
        if available_npcs:
            quest = {
                "quest_type": "talk_to_npc",
                "title": f"Talk to {available_npcs[0]}",
                "description": f"Please deliver a message to {available_npcs[0]}.",
                "target_npc": available_npcs[0],
                "reward_crypto": 10,
                "response": f"That's perfect! I need to get a message to {available_npcs[0]}. Can you help me?"
            }
        else:
            quest = {
                "quest_type": "talk_to_npc",
                "title": "Talk to someone",
                "description": "Please deliver a message to another NPC.",
                "target_npc": "Commander Sarah Chen",
                "reward_crypto": 10,
                "response": "That's perfect! I need to get a message to someone. Can you help me?"
            }
    else:
        # Default quest
        quest = {
            "quest_type": "collect_item",
            "title": f"Collect {available_items[0] if available_items else 'an item'}",
            "description": f"Please collect {available_items[0] if available_items else 'an item'} for me.",
            "target_item": available_items[0] if available_items else "crystal_red",
            "quantity": 1,
            "reward_crypto": 15,
            "response": "I'd be happy to give you a task! Here's something you can help me with."
        }
    
    return quest

def get_npc_data_by_name(npc_name):
    """Get NPC data by name (simplified version)"""
    npc_data = {
        'Commander Sarah Chen': {
            'id': 'commander_sarah',
            'personality': 'authoritative, strategic, concerned about colony security',
            'role': 'Outpost Commander'
        },
        'Engineer Marcus Rodriguez': {
            'id': 'engineer_marcus',
            'personality': 'brilliant but eccentric, obsessed with technology',
            'role': 'Chief Engineer'
        },
        'Trader Eliza Thompson': {
            'id': 'trader_eliza',
            'personality': 'charismatic, opportunistic, well-connected',
            'role': 'Merchant'
        },
        'Scout Jake Williams': {
            'id': 'scout_jake',
            'personality': 'cautious, observant, has seen things in the wilderness',
            'role': 'Frontier Scout'
        },
        'Dr. Kim Park': {
            'id': 'medic_dr_kim',
            'personality': 'compassionate, professional, slightly overwhelmed',
            'role': 'Medical Officer'
        },
        'Rick "The Unfiltered"': {
            'id': 'rick_unfiltered',
            'personality': 'completely unfiltered, crude, says whatever comes to mind, no social boundaries',
            'role': 'Unfiltered Resident'
        }
    }
    return npc_data.get(npc_name)

def generate_llm_dialogue_response(npc_name, personality, role, background, dialogue_style, player_message, player_context, memory_context):
    """Generate LLM response for dialogue"""
    try:
        # Create prompt for the LLM
        prompt = create_dialogue_prompt(npc_name, personality, role, background, dialogue_style, player_message, player_context, memory_context)
        
        # Log token usage before sending
        log_token_usage(prompt, 150, f"Dialogue - {npc_name}")
        
        # Log the prompt being sent
        logger.info(f"=== DIALOGUE REQUEST ===")
        logger.info(f"NPC: {npc_name}")
        logger.info(f"Player Message: {player_message}")
        logger.info(f"Prompt Sent:")
        logger.info(prompt)
        logger.info(f"========================")
        
        # Send request to Ollama
        response = requests.post(f"{OLLAMA_URL}/api/generate", json={
            'model': OLLAMA_MODEL,
            'prompt': prompt,
            'stream': False,
            'options': {
                'temperature': 0.8,
                'max_tokens': 150
            }
        })
        
        if response.status_code == 200:
            result = response.json()
            llm_response = result.get('response', '').strip()
            
            # Clean the response to remove any instruction text
            cleaned_response = clean_dialogue_response(llm_response)
            
            # Log the response received
            logger.info(f"=== DIALOGUE RESPONSE ===")
            logger.info(f"NPC: {npc_name}")
            logger.info(f"Response Received:")
            logger.info(cleaned_response)
            logger.info(f"========================")
            
            return cleaned_response
        else:
            # Log error
            logger.error(f"Ollama API error: {response.status_code} - {response.text}")
            # Fallback response
            return get_fallback_dialogue_response(npc_name)
            
    except Exception as e:
        logger.error(f"Error generating LLM response: {e}")
        return get_fallback_dialogue_response(npc_name)

def clean_dialogue_response(response_text):
    """Clean LLM response to remove instruction text and memory context"""
    if not response_text:
        return "I'm not sure how to respond to that."
    
    # Remove common instruction patterns
    patterns_to_remove = [
        r"If the player asks about.*?\.",  # Remove instruction text
        r"Respond as.*?\.",  # Remove instruction text
        r"Keep responses under.*?\.",  # Remove instruction text
        r"Be true to.*?\.",  # Remove instruction text
        r"If there are relevant memories.*?\.",  # Remove instruction text
        r"Response:",  # Remove response labels
        r"Answer:",  # Remove answer labels
        r"Dialogue:",  # Remove dialogue labels
        r"=== NPC MEMORY CONTEXT ===",  # Remove memory context headers
        r"=== END MEMORY CONTEXT ===",  # Remove memory context footers
        r"RELATIONSHIP STATUS:.*?RECENT CONVERSATION CONTEXT:.*?=== END MEMORY CONTEXT ===",  # Remove full memory context
        r"IMPORTANT INSTRUCTIONS:.*?DO NOT include instruction text in your response",  # Remove instruction block
        r"PERSONALITY:.*?DIALOGUE STYLE:.*?PLAYER CONTEXT:.*?The player says:",  # Remove full prompt
    ]
    
    cleaned = response_text.strip()
    
    # Apply pattern removals
    for pattern in patterns_to_remove:
        cleaned = re.sub(pattern, "", cleaned, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove lines that look like memory context
    lines = cleaned.split('\n')
    filtered_lines = []
    in_memory_context = False
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Skip memory context lines
        if any(keyword in line.lower() for keyword in [
            'relationship status:', 'trust:', 'friendship:', 'respect:', 'attraction:',
            'personal_info:', 'relationship:', 'promises:', 'emotional:', 'gossip:', 'trade:', 'quests:',
            'recent conversation context:', 'player:', 'npc:', 'emotion:',
            '===', 'memory context', 'end memory context'
        ]):
            continue
            
        # Skip instruction lines
        if any(keyword in line.lower() for keyword in [
            'important instructions:', 'respond naturally', 'keep responses', 'be true to',
            'use the memory context', 'do not include', 'personality:', 'background:', 'dialogue style:'
        ]):
            continue
            
        filtered_lines.append(line)
    
    cleaned = ' '.join(filtered_lines).strip()
    
    # If we have a meaningful response, return it
    if cleaned and len(cleaned) > 5:
        return cleaned
    
    # Fallback responses if cleaning removed everything
    fallback_responses = [
        "I'm not sure how to respond to that.",
        "That's an interesting question.",
        "I need to think about that for a moment.",
        "Let me consider what you're asking."
    ]
    
    return random.choice(fallback_responses)

def create_dialogue_prompt(npc_name, personality, role, background, dialogue_style, player_message, player_context, memory_context):
    """Create a prompt for dialogue generation"""
    
    # Simplify context for dialogue
    simplified_context = {
        'crypto': player_context.get('crypto', 0),
        'active_quests_count': len(player_context.get('active_quests', [])),
        'inventory_count': len(player_context.get('inventory', []))
    }
    
    # Format memory context - handle both old and new formats
    memory_text = ""
    if memory_context:
        if "=== NPC MEMORY CONTEXT ===" in memory_context:
            # New enhanced format - use as is
            memory_text = memory_context
        else:
            # Old format - convert to new format
            memory_text = f"\n\n=== NPC MEMORY CONTEXT ===\n{memory_context}\n=== END MEMORY CONTEXT ===\n\n"
    
    prompt = f"""You are {npc_name}, a {role} in a sci-fi frontier outpost.

PERSONALITY: {personality}
BACKGROUND: {background}
DIALOGUE STYLE: {dialogue_style}

PLAYER CONTEXT: {simplified_context}

{memory_text}

The player says: "{player_message}"

IMPORTANT INSTRUCTIONS:
- Respond naturally as {npc_name} in character
- Keep responses under 2-3 sentences
- Use the memory context to inform your response, but don't repeat it
- Be true to your personality and role
- If you remember something relevant from the memory context, reference it naturally
- DO NOT include the memory context text in your response
- DO NOT include instruction text in your response

{npc_name}:
"""
    
    return prompt

def generate_dynamic_quest(npc_id, npc_name, personality, role, player_context, existing_quests, available_items=None, available_npcs=None, player_suggestion=None):
    """Generate a dynamic quest based on NPC personality and context"""
    try:
        prompt = create_quest_prompt(npc_id, npc_name, personality, role, player_context, existing_quests, available_items, available_npcs, player_suggestion)
        
        # Log token usage before sending
        log_token_usage(prompt, 300, f"Quest Generation - {npc_name}")
        
        # Log the quest prompt being sent
        logger.info(f"=== QUEST REQUEST ===")
        logger.info(f"NPC: {npc_name} ({npc_id})")
        logger.info(f"Player Suggestion: {player_suggestion}")
        logger.info(f"Prompt Sent:")
        logger.info(prompt)
        logger.info(f"=====================")
        
        response = requests.post(f"{OLLAMA_URL}/api/generate", json={
            'model': OLLAMA_MODEL,
            'prompt': prompt,
            'stream': False,
            'options': {
                'temperature': 0.8,
                'max_tokens': 300
            }
        })
        
        if response.status_code == 200:
            result = response.json()
            quest_text = result.get('response', '').strip()
            
            # Log the quest response received
            logger.info(f"=== QUEST RESPONSE ===")
            logger.info(f"NPC: {npc_name} ({npc_id})")
            logger.info(f"Response Received:")
            logger.info(quest_text)
            logger.info(f"=====================")
            
            # Parse the response into a quest structure
            return parse_quest_response(quest_text, npc_id, available_items, available_npcs, player_suggestion)
        else:
            logger.error(f"Ollama API error for quest: {response.status_code} - {response.text}")
            return get_fallback_quest(npc_id)
            
    except Exception as e:
        logger.error(f"Error generating quest: {e}")
        return get_fallback_quest(npc_id)

def create_quest_prompt(npc_id, npc_name, personality, role, player_context, existing_quests, available_items=None, available_npcs=None, player_suggestion=None):
    """Create a prompt for quest generation"""
    
    # Simplify context for quest generation
    simplified_context = {
        'crypto': player_context.get('crypto', 0),
        'active_quests_count': len(player_context.get('active_quests', [])),
        'inventory_count': len(player_context.get('inventory', []))
    }
    available_items = available_items or []
    available_npcs = available_npcs or []
    player_suggestion = player_suggestion or ""
    
    prompt = f"""You are generating a quest for a sci-fi frontier outpost game. You must respond with ONLY valid JSON, no other text.

NPC: {npc_name} - {role}
PERSONALITY: {personality}
CONTEXT: {json.dumps(simplified_context, separators=(',', ':'))}
AVAILABLE_ITEMS: {json.dumps(available_items)}
AVAILABLE_NPCS: {json.dumps(available_npcs)}
PLAYER_SUGGESTION: "{player_suggestion}"

Create a quest fitting this NPC's role. IMPORTANT: Consider the player's suggestion carefully:
- If they mention a specific item, use that item if available
- If they mention a reward amount, use that amount (or close to it)
- If they mention a quantity, use that quantity
- If they want a talking quest, create a talk_to_npc quest
- Only use items from AVAILABLE_ITEMS and NPCs from AVAILABLE_NPCS

You must respond with ONLY this exact JSON format, no other text:
{{
    "quest_type": "collect_item",
    "title": "Quest Title", 
    "description": "Quest description",
    "target_item": "item_name",
    "quantity": 1,
    "reward_crypto": 15,
    "response": "NPC's response when offering the quest"
}}

OR for talk quests:
{{
    "quest_type": "talk_to_npc",
    "title": "Quest Title", 
    "description": "Quest description",
    "target_npc": "NPC_name",
    "reward_crypto": 15,
    "response": "NPC's response when offering the quest"
}}

Respond with ONLY the JSON:"""
    
    return prompt

def parse_quest_response(quest_text, npc_id, available_items=None, available_npcs=None, player_suggestion=None):
    """Parse LLM response into quest structure"""
    try:
        # Clean the response text
        quest_text = quest_text.strip()
        
        # Strategy 1: Try to find JSON between curly braces
        if '{' in quest_text and '}' in quest_text:
            start = quest_text.find('{')
            end = quest_text.rfind('}') + 1
            json_str = quest_text[start:end]
            
            # Try to parse the JSON
            try:
                quest = json.loads(json_str)
                logger.info(f"Successfully parsed JSON from LLM response")
                
                # Validate and fix quest data
                quest = validate_quest_data(quest, available_items, available_npcs, player_suggestion)
                
                # Ensure required fields
                quest['id'] = quest.get('id', f"{npc_id}_quest_{datetime.now().timestamp()}")
                quest['status'] = 'available'
                
                return quest
            except json.JSONDecodeError as e:
                logger.warning(f"JSON parsing failed: {e}")
        
        # Strategy 2: Try to extract JSON from lines that look like JSON
        lines = quest_text.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('{') and line.endswith('}'):
                try:
                    quest = json.loads(line)
                    logger.info(f"Successfully parsed JSON from line: {line}")
                    
                    # Validate and fix quest data
                    quest = validate_quest_data(quest, available_items, available_npcs, player_suggestion)
                    
                    # Ensure required fields
                    quest['id'] = quest.get('id', f"{npc_id}_quest_{datetime.now().timestamp()}")
                    quest['status'] = 'available'
                    
                    return quest
                except json.JSONDecodeError:
                    continue
        
        # Strategy 3: Try to fix common JSON issues
        # Remove quotes around the entire response if present
        if quest_text.startswith('"') and quest_text.endswith('"'):
            quest_text = quest_text[1:-1]
        
        # Try to find the first valid JSON object
        import re
        json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
        matches = re.findall(json_pattern, quest_text)
        
        for match in matches:
            try:
                quest = json.loads(match)
                logger.info(f"Successfully parsed JSON using regex: {match}")
                
                # Validate and fix quest data
                quest = validate_quest_data(quest, available_items, available_npcs, player_suggestion)
                
                # Ensure required fields
                quest['id'] = quest.get('id', f"{npc_id}_quest_{datetime.now().timestamp()}")
                quest['status'] = 'available'
                
                return quest
            except json.JSONDecodeError:
                continue
        
        # If all strategies fail, log the problematic response and fallback
        logger.error(f"Failed to parse quest response. Raw response: {quest_text}")
        return get_fallback_quest(npc_id)
            
    except Exception as e:
        logger.error(f"Error parsing quest response: {e}")
        logger.error(f"Raw response was: {quest_text}")
        return get_fallback_quest(npc_id)

def validate_quest_data(quest, available_items=None, available_npcs=None, player_suggestion=None):
    """Validate and fix quest data to ensure it uses only available items/NPCs"""
    available_items = available_items or []
    available_npcs = available_npcs or []
    
    # Extract reward amount from player suggestion if mentioned
    if player_suggestion:
        import re
        # Look for numbers followed by "crypto" or just numbers that might be crypto amounts
        crypto_matches = re.findall(r'(\d+)\s*crypto', player_suggestion.lower())
        if crypto_matches:
            suggested_reward = int(crypto_matches[0])
            # Use the suggested reward, but cap it at a reasonable amount (1000 instead of 200)
            quest['reward_crypto'] = min(suggested_reward, 1000)
            logger.info(f"Using player-suggested reward: {suggested_reward} crypto (capped at {quest['reward_crypto']})")
    
    # Validate collect_item quests
    if quest.get('quest_type') == 'collect_item':
        target_item = quest.get('target_item')
        
        # If target item is not in available items, try to find a close match
        if target_item and target_item not in available_items:
            logger.warning(f"Target item '{target_item}' not in available items, looking for close match")
            
            # Try to find a close match based on player suggestion
            if player_suggestion:
                suggestion_lower = player_suggestion.lower()
                
                # Look for item mentions in the suggestion
                for item in available_items:
                    item_lower = item.lower()
                    # Check if the item name or parts of it appear in the suggestion
                    if (item_lower in suggestion_lower or 
                        any(word in suggestion_lower for word in item_lower.split('_'))):
                        quest['target_item'] = item
                        logger.info(f"Found close match: '{target_item}' -> '{item}'")
                        break
                
                # If no close match found, try some common mappings
                if quest['target_item'] not in available_items:
                    common_mappings = {
                        'alien': 'alien_relic',
                        'crystal': 'crystal_red',
                        'rock': 'space_rock',
                        'ore': 'iron_ore',
                        'plant': 'plant_fiber',
                        'artifact': 'enigmatic_artifact',
                        'dust': 'cosmic_dust',
                        'shard': 'impact_shard',
                        'spire': 'crystal_spires',
                        'rubble': 'ancient_rubble',
                        'stalk': 'glow_stalk',
                        'fragment': 'meteorite_fragment',
                        'azure': 'azure_crystal'
                    }
                    
                    for keyword, item_id in common_mappings.items():
                        if keyword in suggestion_lower and item_id in available_items:
                            quest['target_item'] = item_id
                            logger.info(f"Using keyword mapping: '{keyword}' -> '{item_id}'")
                            break
            
            # If still no match, use first available item
            if quest['target_item'] not in available_items:
                if available_items:
                    quest['target_item'] = available_items[0]
                    logger.warning(f"No match found, using first available item: {available_items[0]}")
                else:
                    quest['target_item'] = 'crystal_red'
        
        # Extract quantity from player suggestion if mentioned
        if player_suggestion:
            import re
            # Look for numbers followed by quantity words
            quantity_matches = re.findall(r'(\d+)\s*(?:pieces?|items?|units?|of)', player_suggestion.lower())
            if quantity_matches:
                suggested_quantity = int(quantity_matches[0])
                quest['quantity'] = min(suggested_quantity, 10)  # Cap at 10
                logger.info(f"Using player-suggested quantity: {suggested_quantity}")
            # Also check for words like "some", "a few", "several"
            elif any(word in player_suggestion.lower() for word in ['some', 'a few', 'several']):
                quest['quantity'] = 3
                logger.info("Using 'some' quantity: 3")
            elif 'a ' in player_suggestion.lower() or 'an ' in player_suggestion.lower():
                quest['quantity'] = 1
                logger.info("Using single item quantity: 1")
    
    # Validate talk_to_npc quests
    elif quest.get('quest_type') == 'talk_to_npc':
        target_npc = quest.get('target_npc')
        if target_npc and target_npc not in available_npcs:
            logger.warning(f"Target NPC '{target_npc}' not in available NPCs, using first available")
            if available_npcs:
                quest['target_npc'] = available_npcs[0]
            else:
                quest['target_npc'] = 'Commander Sarah Chen'
    
    return quest

def get_fallback_dialogue_response(npc_name):
    """Get fallback dialogue responses when LLM is unavailable"""
    fallback_responses = {
        'Commander Sarah Chen': "At ease, soldier. The outpost is running smoothly, but we always need to stay vigilant. Is there something specific you need assistance with?",
        'Engineer Marcus Rodriguez': "Oh! Hello there! I was just working on some fascinating modifications to the power grid. The quantum flux capacitors are behaving most unusually today!",
        'Trader Eliza Thompson': "Well hello, handsome! I've got some excellent deals today. Just got a shipment of rare materials from the outer colonies. Interested?",
        'Scout Jake Williams': "*whispers* You should be careful out there. I've seen things in the wilderness that would make your blood run cold. The outpost walls are all that keep us safe.",
        'Dr. Kim Park': "Hello! I hope you're feeling well. The medical bay is fully stocked, but I'm always concerned about the health of our outpost residents. How are you holding up?"
    }
    
    return fallback_responses.get(npc_name, "Hello there! I'd be happy to help you with whatever you need around the outpost.")

def get_fallback_quest(npc_id):
    """Get fallback quest when LLM is unavailable"""
    fallback_quests = {
        'commander_sarah': {
            'id': f'fallback_commander_{datetime.now().timestamp()}',
            'title': 'Security Assessment',
            'description': 'Conduct a security assessment of the outpost perimeter and report any vulnerabilities',
            'reward': 'Military commendation and access to restricted areas',
            'status': 'available',
            'objectives': [
                {
                    'id': 'assess_perimeter',
                    'description': 'Check all security checkpoints around the outpost',
                    'target': 4,
                    'progress': 0
                }
            ]
        },
        'engineer_marcus': {
            'id': f'fallback_engineer_{datetime.now().timestamp()}',
            'title': 'Power Grid Maintenance',
            'description': 'Help maintain the outpost power grid by checking and repairing critical systems',
            'reward': 'Technical schematics and engineering tools',
            'status': 'available',
            'objectives': [
                {
                    'id': 'repair_systems',
                    'description': 'Repair 3 critical power systems',
                    'target': 3,
                    'progress': 0
                }
            ]
        },
        'trader_eliza': {
            'id': f'fallback_trader_{datetime.now().timestamp()}',
            'title': 'Supply Chain Management',
            'description': 'Help manage the supply chain by delivering goods to various outpost locations',
            'reward': 'Credits and rare trade goods',
            'status': 'available',
            'objectives': [
                {
                    'id': 'deliver_goods',
                    'description': 'Deliver supplies to 5 different locations',
                    'target': 5,
                    'progress': 0
                }
            ]
        },
        'scout_jake': {
            'id': f'fallback_scout_{datetime.now().timestamp()}',
            'title': 'Wilderness Reconnaissance',
            'description': 'Scout the dangerous areas beyond the outpost and report any threats',
            'reward': 'Survival gear and wilderness knowledge',
            'status': 'available',
            'objectives': [
                {
                    'id': 'scout_areas',
                    'description': 'Explore 3 dangerous areas and report findings',
                    'target': 3,
                    'progress': 0
                }
            ]
        },
        'medic_dr_kim': {
            'id': f'fallback_medic_{datetime.now().timestamp()}',
            'title': 'Medical Supply Run',
            'description': 'Help gather medical supplies and check on the health of outpost residents',
            'reward': 'Medical supplies and first aid training',
            'status': 'available',
            'objectives': [
                {
                    'id': 'gather_supplies',
                    'description': 'Collect medical supplies from 4 locations',
                    'target': 4,
                    'progress': 0
                }
            ]
        },
        'unfiltered_rick': {
            'id': f'fallback_rick_{datetime.now().timestamp()}',
            'title': 'Shady Business',
            'description': 'Help me with some... let\'s say "unofficial" business around the outpost. Nothing illegal, just... creative.',
            'reward': 'Some crypto and maybe some interesting stories',
            'status': 'available',
            'objectives': [
                {
                    'id': 'shady_tasks',
                    'description': 'Complete some questionable but profitable tasks',
                    'target': 3,
                    'progress': 0
                }
            ]
        }
    }
    
    return fallback_quests.get(npc_id, fallback_quests['commander_sarah'])

if __name__ == '__main__':
    print("Starting LLM Sci-Fi Game Backend...")
    print(f"Ollama URL: {OLLAMA_URL}")
    print(f"Ollama Model: {OLLAMA_MODEL}")
    print("Server running on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=True, reloader_type='watchdog') 