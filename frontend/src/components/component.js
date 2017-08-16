import React from 'react';
import { Menu, Dropdown, Icon, Input, Button, Modal, Col, Row} from 'antd';

export function stateGetterSetter(component, stateName) {
    return {
        get: () => {
            return component.state[stateName];
        },
        set: (value, afterFunc) => {
            component.setState({stateName, value}, afterFunc);
        }
    };
}

export class SimpleInputModal extends React.Component {
    state = {
        visible: false
    }

    show = () => {
        this.setState({visible: true}, () => this.refs.input.focus());
    }

    handleCancel = () => {
        this.setState({visible: false});
    }

    handleInputConfirm = (e) => {
        this.props.onConfirm(e.target.value);
        e.target.value = ""; /* 清空输入框 */
        this.setState({visible: false});
    }

    render() {
        return (
            <Modal
                title={this.props.title}
                visible={this.state.visible}
                onOk = { () => this.setState({visible: false}) }
                onCancel = { () => this.setState({visible: false}) }
                footer={null} >
                <Row>
                    <Col offset={4} span={15}>
                        <Input
                            placeholder={this.props.placeholder}
                            prefix={this.props.prefix}
                            ref="input"
                            size="large"
                            onPressEnter={this.handleInputConfirm }
                        />
                    </Col>
                </Row>
            </Modal>);
    }
}
