import React from "react"

export default class OpenApiWidget extends React.Component {

    constructor(...args) {
        super(...args)
        this.state = {
            loading: false,
            error: null,
            items: [],
            openAIResponse: ""
        };
    }

    componentDidMount() {
        this.getOpenApiResponse(this.props.items, this.props.patient, this.props.type);
    }

    componentWillReceiveProps(newProps) {
        this.getOpenApiResponse(newProps.items, newProps.patient, newProps.type);
    }

    getOpenApiResponse(items, patient, type) {
        this.setState({ loading: true, error: null }, () => {
            fetch("http://localhost:8000/openai",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ "patient": patient, "entries": items, "category": type })
                }).then((response) => response.json())
                .then(data => {
                    this.state.openAIResponse = data.response;
                    this.setState({
                        ...this.state,
                        error: null,
                        loading: false
                    });
                })
                .catch(error => {
                    console.warn(error);
                    this.setState({
                        loading: false,
                        error
                    })
                })
        })
    }


    render() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading"><b className="text-primary"><i className="fa fa-magic" style={{ marginRight: 5 }}></i>Open AI</b></div>
                <div className="table-responsive" style={{ padding: 10 }}>
                    {
                        this.state.loading && <div style={{ textAlign: 'center' }}><i className="fa fa-spinner fa-spin fa-2x" title="Asking OpenAI..." style={{ margin: '20px auto' }}></i></div>
                    }
                    {
                        !this.state.loading && !this.state.error && this.state.openAIResponse && this.state.openAIResponse.choices && this.state.openAIResponse.choices[0].message.content
                    }
                    {
                        this.state.error && "Error calling OpenAI - check the browser console"
                    }

                </div>
            </div>
        )
    }
}