import React from 'react';
import { appService, organizationService } from '@/_services';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton from 'react-loading-skeleton';
import SelectSearch, { fuzzySearch } from 'react-select-search';

class ManageAppUsers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            appId: props.appId,
            isLoading: true,
            addingUser: false,
            organizationUsers: [],
            newUser: {}
        };
    }

    componentDidMount() {

        const appId = this.props.appId;

        this.fetchAppUsers();

        organizationService.getUsers(null).then(data => this.setState({ 
            organizationUsers: data.users, 
        })); 

        this.setState({ appId });
    }

    fetchAppUsers = () => {
        appService.getAppUsers(this.props.appId).then(data => this.setState({ 
            users: data.users, 
            isLoading: false,
        }));   
    }

    hideModal = () => {
        this.setState({ 
            showModal: false
        });
    }

    addUser = () => {
        this.setState({
            addingUser: true
        });

        const { organizationUserId, role } = this.state.newUser;

        appService.createAppUser(this.state.appId, organizationUserId, role).then(data =>  {
            this.setState({ addingUser: false, newUser: {} });
            toast.success('Added user successfully', { hideProgressBar: true, position: "top-center", });
            this.fetchAppUsers();
        }).catch(error => {
            this.setState({ addingUser: false });
            toast.error(error, { hideProgressBar: true, position: "top-center" });
        });    
    }
   
    render() {
        const { addingUser, isLoading, users, organizationUsers, newUser } = this.state;
        const shareableLink = `${window.location.origin}/applications/${this.state.appId}`;

        return (
            <div>

                <button className="btn btn-sm" onClick={() => this.setState({ showModal: true })}> Share</button>

                <Modal
                    show={this.state.showModal}
                    size="lg"
                    backdrop="static"
                    centered={true}
                    keyboard={true}>

                        <Modal.Header>
                            <Modal.Title>
                                Users and permissions
                            </Modal.Title>
                            <div>
                                <Button variant="light" size="sm" onClick={() => this.hideModal()}>
                                    x
                                </Button>
                            </div>
                            
                        </Modal.Header>

                        <Modal.Body>
                            {isLoading ? 
                                <div style={{width: '100%'}} className="p-5">
                                    <Skeleton count={5}/> 
                                </div>
                            :
                                <div>
                                    <div className="make-public mb-3">
                                        <label className="form-check form-switch">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                onClick={() => this.toggleOption('runOnPageLoad')}
                                                checked={false}
                                                disabled={true}
                                            />
                                            <span className="form-check-label">Make application public ?</span>
                                        </label>
                                    </div>
                                    <div className="shareable-link mb-3">
                                        <label className="form-label"><small>Get shareable link for this application</small></label>
                                        <div class="input-group">
                                                <input 
                                                    type="text" 
                                                    class="form-control form-control-sm" 
                                                    value={shareableLink}
                                                />
                                                <span class="input-group-text">
                                                    <CopyToClipboard text={shareableLink}
                                                        onCopy={() => toast.success('Link copied to clipboard', { hideProgressBar: true, position: "bottom-center", })}
                                                    >
                                                        <button className="btn btn-light btn-sm">Copy</button>
                                                    </CopyToClipboard>
                                                </span>
                                        </div>
                                    </div>
                                    <hr/>
                                    <div className="add-user mb-3">
                                        <div className="row">
                                        <div className="col">
                                                <SelectSearch 
                                                    options={organizationUsers.map(user => { 
                                                        return {
                                                            name: `${user.name} ( ${user.email} )`,
                                                            value: user.id
                                                        }
                                                    })}
                                                    value={newUser.organizationUserId} 
                                                    search={true}
                                                    onChange={(value) => { this.setState({ newUser: { ...newUser, organizationUserId: value} })}}
                                                    filterOptions={fuzzySearch}
                                                    placeholder="Select organization user" 
                                                />
                                            </div>
                                            <div style={{width: '160px'}}>
                                                <SelectSearch 
                                                    options={[
                                                        { name: 'Admin', value: 'admin' },
                                                        { name: 'Developer', value: 'developer' },
                                                        { name: 'Viewer', value: 'role' }
                                                    ]}
                                                    value={newUser.role} 
                                                    search={false}
                                                    onChange={(value) => { this.setState({ newUser: { ...newUser, role: value} })}}
                                                    filterOptions={fuzzySearch}
                                                    placeholder="Select role" 
                                                />
                                            </div>
                                            <div className="col-auto">
                                                <button 
                                                    className={`btn btn-primary + ${addingUser ? ' btn-loading' : ''}`}
                                                    onClick={this.addUser}
                                                    disabled={addingUser}
                                                >
                                                    Add User
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="table-responsive">
                                        <table
                                                class="table table-vcenter">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Role</th>
                                                    <th class="w-1"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((user) => 
                                                    <tr>
                                                        <td >{user.name}</td>
                                                        <td class="text-muted" >
                                                            <span lass="text-reset">{user.email}</span>
                                                        </td>
                                                        <td class="text-muted" >
                                                            {user.role}
                                                        </td>
                                                        <td>
                                                            <a>Remove</a>
                                                        </td>
                                                    </tr>
                                                )}
                                                
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            }

                        </Modal.Body>

                        <Modal.Footer>
                            <a href="/users" target="_blank">Manage Organization Users</a>
                        </Modal.Footer>
                </Modal>
            </div>
            
        )
    }
}

export { ManageAppUsers };
