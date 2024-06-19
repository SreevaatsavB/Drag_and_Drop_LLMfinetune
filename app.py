from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
from threading import Thread

app = Flask(__name__)
CORS(app)

node_statuses = {}
test_node_id = None
deploy_node_id = None
node_types = {}
node_values = {}

def validate_flow(data):
    nodes = data.get('nodes', [])
    edges = data.get('edges', [])

    global node_types, node_values, test_node_id, deploy_node_id
    node_types = {node['id']: node['data']['label'].split(" ")[0] for node in nodes}
    node_values = {node['id']: node['data'] for node in nodes}

    required_nodes = {'Dataset', 'Preprocess', 'Train', 'Test', 'Deploy'}
    found_nodes = {node_types[node_id] for node_id in node_types}

    if not required_nodes.issubset(found_nodes):
        return False, "Not all required node types are present."

    for node_id, node_type in node_types.items():
        if node_type == 'Dataset' and not node_values[node_id].get('url'):
            return False, "Dataset node missing URL."
        if node_type == 'Preprocess' and not node_values[node_id].get('prompt'):
            return False, "Preprocess node missing prompt."
        if node_type == 'Train':
            if not node_values[node_id].get('temperature'):
                return False, "Train node missing temperature."
            if not node_values[node_id].get('cred'):
                return False, "Train node missing credentials."
        if node_type == 'Test':
            test_node_id = node_id  # Store the Test node ID
        if node_type == 'Deploy':
            deploy_node_id = node_id  # Store the Deploy node ID
            if not node_values[node_id].get('typeValue'):
                return False, "Deploy node missing type value."
    
    node_connections = {node['id']: [] for node in nodes}
    for edge in edges:
        source_id = edge['source']
        target_id = edge['target']
        node_connections[source_id].append(target_id)

    node_order = ['Dataset', 'Preprocess', 'Train', 'Test', 'Deploy']
    for i in range(len(node_order) - 1):
        source_type = node_order[i]
        target_type = node_order[i + 1]

        source_node_id = next((nid for nid, ntype in node_types.items() if ntype == source_type), None)
        target_node_id = next((nid for nid, ntype in node_types.items() if ntype == target_type), None)

        if not source_node_id or not target_node_id:
            return False, f"Nodes {source_type} and {target_type} are not present."

        if target_node_id not in node_connections[source_node_id]:
            return False, f"Node {source_type} is not connected to {target_type}."

    # return True, "All nodes are correctly configured and connected."

    print()
    print("test_node_id -> ", test_node_id)
    print()
    return True, "All nodes are correctly configured and connected."

def execute_node(node_id):
    node_type = node_types[node_id]
    node_values_local = node_values[node_id]

    print(node_values_local)
    try:
        if node_type == 'Dataset':
            dataset_url = node_values_local.get('url')
            dataset_url = "http://localhost:8000/process-data"
            payload = {
                "dataset_name": "medqa",
                "base_model": "meta-llama/Meta-Llama-3-8B-Instruct",
                "token_hf": "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"
            }
            headers = {
                "accept": "application/json",
                "Content-Type": "application/json"
            }
            response = requests.post(dataset_url, json=payload, headers=headers)
            if response.status_code == 200:
                print("Dataset obtained ...")
                node_statuses[node_id] = 'completed'
            else:
                raise Exception(f"Request failed with status code {response.status_code}")

        elif node_type == 'Preprocess':
            time.sleep(1)
            print("Preprocessing done")
            node_statuses[node_id] = 'completed'

        elif node_type == 'Train':
            train_model_payload = {
                "base_model": "meta-llama/Meta-Llama-3-8B-Instruct",
                # "token_hf": node_values_local.get('cred'),
                "token_hf": "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",
                # "temperature": node_values_local.get('temperature'),
                "temperature": 0.01
            }
            train_model_url = "http://localhost:8000/train-model"
            headers = {
                "accept": "application/json",
                "Content-Type": "application/json"
            }
            response = requests.post(train_model_url, json=train_model_payload, headers=headers)
            if response.status_code == 200:
                print("Model trained and pushed to hub successfully")
                node_statuses[node_id] = 'completed'
                # Trigger the Test node after Train node completes
                if test_node_id:
                    node_statuses[test_node_id] = 'waiting_for_input'
            else:
                raise Exception(f"Error training model: {response.text}")

        elif node_type == 'Deploy':
            time.sleep(1)
            print("Deployment done")
            node_statuses[node_id] = 'completed'

        else:
            pass

    except Exception as e:
        print(f"Error processing node {node_id} of type {node_type}: {str(e)}")
        node_statuses[node_id] = 'failed'

@app.route('/execute', methods=['POST'])
def execute():
    data = request.get_json()
    is_valid, message = validate_flow(data)

    global node_order
    node_order = ['Dataset', 'Preprocess', 'Train', 'Test', 'Deploy']

    if is_valid:
        nodes = data.get('nodes', [])
        node_types = {node['id']: node['data']['label'].split(" ")[0] for node in nodes}
        node_values = {node['id']: node['data'] for node in nodes}

        print(node_values)
        # {'3': {'label': 'Dataset Node 3', 'url': 'dec', 'cred': 'ec'}, '4': {'label': 'Preprocess Node 4', 'prompt': 'ecerv'}, '5': {'label': 'Train Node 5', 'temperature': '1', 'cred': 'dcv'}, '6': {'label': 'Test Node 6'}, '7': {'label': 'Deploy Node 7', 'typeValue': 'Batch'}}
        def execute_nodes():
            
            for node_type in node_order:
                node_id = next((nid for nid, ntype in node_types.items() if ntype == node_type), None)
                if node_id:

                    if node_id == test_node_id:
                        # break  # Wait for approval to proceed
                        if node_id == test_node_id:
                            if node_statuses[node_id-1] == "completed":
                                execute_node(node_id)

                            if node_statuses[node_id] == 'failed':
                                break
                        
                    else:
                        node_statuses[node_id] = 'running'
                        execute_node(node_id)
                        if node_statuses[node_id] == 'failed':
                            break
                    # if node_id == test_node_id:
                    #     break  # Wait for approval to proceed

        thread = Thread(target=execute_nodes)
        thread.start()

        return jsonify({'status': 'success', 'message': 'Execution started'})
    else:
        return jsonify({'status': 'error', 'message': message})

@app.route('/status', methods=['GET'])
def get_status():
    return jsonify(node_statuses)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get('input', '')

    test_url = "http://localhost:8000/test-model"
    test_payload = {"input_text": user_input}
    headers = {
        "accept": "application/json",
        "Content-Type": "application/json"
    }
    response = requests.post(test_url, json=test_payload, headers=headers)
    if response.status_code == 200:
        model_output = response.json().get('output', 'No output')
    else:
        model_output = f"Error: {response.text}"

    return jsonify({"output": model_output})

@app.route('/approve', methods=['POST'])
def approve():
    data = request.get_json()
    node_id = data.get('node_id')
    print("data = ", data)
    print()
    print("Node id =", node_id)
    if node_id in node_statuses and node_statuses[node_id] == 'waiting_for_input':
        node_statuses[node_id] = 'completed'
        # Trigger Deploy node after approval
        if deploy_node_id:
            node_statuses[deploy_node_id] = 'running'
            execute_node(deploy_node_id)
        return jsonify({'status': 'success', 'message': 'Node approved and completed'})
    else:
        return jsonify({'status': 'error', 'message': 'Node not in waiting_for_input state'})

@app.route('/disapprove', methods=['POST'])
def disapprove():
    data = request.get_json()
    node_id = data.get('node_id')

    if node_id in node_statuses and node_statuses[node_id] == 'waiting_for_input':
        node_statuses[node_id] = 'failed'
        return jsonify({'status': 'success', 'message': 'Node disapproved and marked as failed'})
    else:
        return jsonify({'status': 'error', 'message': 'Node not in waiting_for_input state'})

if __name__ == '__main__':
    app.run(debug=True)
