import React, { Component } from "react";
import PropTypes from "prop-types";
import { injectIntl, FormattedMessage } from "react-intl";
import { SCHEMA } from "../storage/store";
import styles from "../assets/stylesheets/profile.scss";
import classNames from "classnames";
import hubLogo from "../assets/images/hub-preview-white.png";
import { WithHoverSound } from "./wrap-with-audio";
import { avatars } from "../assets/avatars/avatars";

import { getReticulumFetchUrl } from "../utils/phoenix-utils";
import { upload } from "../utils/media-utils";

const BOT_PARENT_AVATAR = "zqXoGT5";

class AvatarEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.inputFiles = {
      glb: undefined,

      base_map: undefined,
      emissive_map: undefined,
      normal_map: undefined,

      ao_map: undefined,
      metalic_map: undefined,
      roughness_map: undefined,

      ao_metalic_roughness_map: undefined
    };
  }

  componentDidMount = async () => {
    console.log(this.props.store.state);
    const { personalAvatarId } = this.props.store.state.profile;
    const avatar = await (personalAvatarId
      ? this.getAvatar(personalAvatarId)
      : this.createOrUpdateAvatar({ name: "My Avatar", parent_avatar_id: BOT_PARENT_AVATAR }));

    this.props.store.update({
      profile: {
        personalAvatarId: avatar.avatar_id
      }
    });

    this.props.onAvatarChanged(avatar.avatar_id);

    this.setState({ ...this.state, avatar });
  };

  getAvatar = avatarId =>
    fetch(getReticulumFetchUrl(`/api/v1/avatars/${avatarId}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `bearer ${this.props.store.state.credentials.token}`
      }
    })
      .then(r => r.json())
      .then(({ avatars }) => avatars[0]);

  createOrUpdateAvatar = avatar =>
    fetch(getReticulumFetchUrl(avatar.avatar_id ? `/api/v1/avatars/${avatar.avatar_id}` : "/api/v1/avatars"), {
      method: avatar.avatar_id ? "PUT" : "POST",
      body: JSON.stringify({ avatar }),
      headers: {
        "Content-Type": "application/json",
        authorization: `bearer ${this.props.store.state.credentials.token}`
      }
    })
      .then(r => r.json())
      .then(({ avatars }) => avatars[0]);

  uploadAvatar = async e => {
    e.preventDefault();

    console.log(this.state.avatar, this.inputFiles);

    if (this.inputFiles.glb) {
      const gltfLoader = new THREE.GLTFLoader();
      gltfLoader.setLazy(true);
      const gltfUrl = URL.createObjectURL(this.inputFiles.glb);
      const onProgress = console.log;
      const { parser } = await new Promise((resolve, reject) => gltfLoader.load(gltfUrl, resolve, onProgress, reject));

      const { content, body } = parser.extensions.KHR_binary_glTF;
      this.inputFiles.gltf = new File([content], "file.gltf", {
        type: "model/gltf"
      });
      this.inputFiles.bin = new File([body], "file.bin", {
        type: "application/octet-stream"
      });
    }

    const filesToUpload = ["gltf", "bin", "base_map", "emissive_map", "normal_map", "ao_metalic_roughness_map"].filter(
      k => !!this.inputFiles[k]
    );

    this.setState({ uploading: true });

    const fileUploads = await Promise.all(filesToUpload.map(f => this.inputFiles[f] && upload(this.inputFiles[f])));
    console.log(filesToUpload, fileUploads);
    const avatar = {
      ...this.state.avatar,
      files: fileUploads
        .map((resp, i) => [filesToUpload[i], [resp.file_id, resp.meta.access_token, resp.meta.promotion_token]])
        .reduce((o, [k, v]) => ({ ...o, [k]: v }), {})
    };
    console.log(avatar);

    await this.createOrUpdateAvatar(avatar);

    this.props.onAvatarChanged(avatar.avatar_id);

    this.setState({ uploading: false });
  };

  fileField = (name, title, accept, disabled = false) => (
    <div className={styles.fileInputRow} key={name}>
      <label htmlFor={`avatar-file_${name}`}>
        <div className="img-box">{this.state.avatar.files[name] && <img src={this.state.avatar.files[name]} />}</div>
        <span>{title}</span>
      </label>
      <input
        id={`avatar-file_${name}`}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={e => {
          this.inputFiles[name] = e.target.files[0];
          URL.revokeObjectURL(this.state.avatar.files[name]);
          this.setState({
            avatar: {
              ...this.state.avatar,
              files: {
                ...this.state.avatar.files,
                [name]: URL.createObjectURL(e.target.files[0])
              }
            }
          });
        }}
      />
    </div>
  );

  render() {
    if (!this.state.avatar) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        {/* <div> */}
        {/*   <label htmlFor="#avatar-id">Avatar Id</label> */}
        {/*   <input */}
        {/*     id="avatar-id" */}
        {/*     type="text" */}
        {/*     disabled */}
        {/*     value={this.state.avatar.avatar_id} */}
        {/*     onChange={e => this.setState({ avatar: { ...this.state.avatar, avatar_id: e.target.value } })} */}
        {/*   /> */}
        {/* </div> */}
        {/* <div> */}
        {/*   <label htmlFor="#avatar-parent_id">Parent Avatar Id</label> */}
        {/*   <input */}
        {/*     id="avatar-parent_avatar_id" */}
        {/*     type="text" */}
        {/*     disabled */}
        {/*     value={this.state.avatar.parent_avatar_id} */}
        {/*     onChange={e => this.setState({ avatar: { ...this.state.avatar, parent_avatar_id: e.target.value } })} */}
        {/*   /> */}
        {/* </div> */}
        {/* <div> */}
        {/*   <label htmlFor="#avatar-name">Avatar Name</label> */}
        {/*   <input */}
        {/*     id="avatar-name" */}
        {/*     type="text" */}
        {/*     value={this.state.avatar.name} */}
        {/*     onChange={e => this.setState({ avatar: { ...this.state.avatar, name: e.target.value } })} */}
        {/*   /> */}
        {/* </div> */}
        {/* <div> */}
        {/*   <label htmlFor="#avatar-description">Avatar Desxription</label> */}
        {/*   <textarea */}
        {/*     id="avatar-desxription" */}
        {/*     type="text" */}
        {/*     value={this.state.avatar.description} */}
        {/*     onChange={e => this.setState({ avatar: { ...this.state.avatar, description: e.target.value } })} */}
        {/*   /> */}
        {/* </div> */}
        {/* <div> */}
        {/*   <label htmlFor="#avatar-allow_remixing">Allow Remixing</label> */}
        {/*   <input */}
        {/*     id="avatar-allow_remixing" */}
        {/*     type="checkbox" */}
        {/*     value={this.state.avatar.allow_remixing} */}
        {/*     onChange={e => this.setState({ avatar: { ...this.state.avatar, allow_remixing: e.target.value } })} */}
        {/*   /> */}
        {/* </div> */}
        {/* <div> */}
        {/*   <label htmlFor="#avatar-allow_promotion">Allow Promotion</label> */}
        {/*   <input */}
        {/*     id="avatar-allow_promotion" */}
        {/*     type="checkbox" */}
        {/*     value={this.state.avatar.allow_promotion} */}
        {/*     onChange={e => this.setState({ avatar: { ...this.state.avatar, allow_promotion: e.target.value } })} */}
        {/*   /> */}
        {/* </div> */}

        {/* {this.fileField("glb", "Avatar GLB", "model/gltf+binary,.glb")} */}

        {this.fileField("base_map", "Base Map", "images/*")}
        {this.fileField("emissive_map", "Emissive Map", "images/*")}
        {this.fileField("normal_map", "Normal Map", "images/*")}

        {this.fileField("ao_metalic_roughness_map", "AO+Metalic+Roughness Map", "images/*")}

        {/* {this.fileField("ao_map", "AO Map", "images/\*", true)} */}
        {/* {this.fileField("metalic_map", "Metalic Map", "images/\*", true)} */}
        {/* {this.fileField("roughness_map", "Roughness Map", "images/\*", true)} */}

        <button onClick={this.uploadAvatar} disabled={this.state.uploading}>
          {this.state.uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    );
  }
}

class ProfileEntryPanel extends Component {
  static propTypes = {
    store: PropTypes.object,
    messages: PropTypes.object,
    finished: PropTypes.func,
    intl: PropTypes.object
  };

  constructor(props) {
    super(props);
    const { displayName, avatarId } = this.props.store.state.profile;
    console.log(avatarId);
    this.state = { displayName, avatarId, customMode: !avatarId ? false : avatarId.startsWith("http") ? "url" : "id" };
    this.props.store.addEventListener("statechanged", this.storeUpdated);
  }

  storeUpdated = () => {
    const { avatarId, displayName } = this.props.store.state.profile;
    this.setState({ avatarId, displayName });
  };

  saveStateAndFinish = e => {
    e.preventDefault();

    const { displayName } = this.props.store.state.profile;
    const { hasChangedName } = this.props.store.state.activity;

    const hasChangedNowOrPreviously = hasChangedName || this.state.displayName !== displayName;
    this.props.store.update({
      activity: {
        hasChangedName: hasChangedNowOrPreviously
      },
      profile: {
        displayName: this.state.displayName,
        avatarId: this.state.avatarId
      }
    });
    this.props.finished();
  };

  stopPropagation = e => {
    e.stopPropagation();
  };

  setAvatarStateFromIframeMessage = e => {
    if (e.source !== this.avatarSelector.contentWindow) {
      return;
    }
    this.setState({ avatarId: e.data.avatarId });

    // Send it back down to cause avatar picker UI to update.
    this.sendAvatarStateToIframe();
  };

  sendAvatarStateToIframe = () => {
    this.avatarSelector.contentWindow.postMessage({ avatarId: this.state.avatarId }, location.origin);
  };

  componentDidMount() {
    // stop propagation so that avatar doesn't move when wasd'ing during text input.
    this.nameInput.addEventListener("keydown", this.stopPropagation);
    this.nameInput.addEventListener("keypress", this.stopPropagation);
    this.nameInput.addEventListener("keyup", this.stopPropagation);
    window.addEventListener("message", this.setAvatarStateFromIframeMessage);
  }

  componentWillUnmount() {
    this.props.store.removeEventListener("statechanged", this.storeUpdated);
    this.nameInput.removeEventListener("keydown", this.stopPropagation);
    this.nameInput.removeEventListener("keypress", this.stopPropagation);
    this.nameInput.removeEventListener("keyup", this.stopPropagation);
    window.removeEventListener("message", this.setAvatarStateFromIframeMessage);
  }

  render() {
    const { formatMessage } = this.props.intl;

    return (
      <div className={styles.profileEntry}>
        <form onSubmit={this.saveStateAndFinish} className={styles.form}>
          <div className={classNames([styles.box, styles.darkened])}>
            <label htmlFor="#profile-entry-display-name" className={styles.title}>
              <FormattedMessage id="profile.header" />
            </label>
            <input
              id="profile-entry-display-name"
              className={styles.formFieldText}
              value={this.state.displayName}
              onFocus={e => e.target.select()}
              onChange={e => this.setState({ displayName: e.target.value })}
              required
              spellCheck="false"
              pattern={SCHEMA.definitions.profile.properties.displayName.pattern}
              title={formatMessage({ id: "profile.display_name.validation_warning" })}
              ref={inp => (this.nameInput = inp)}
            />

            <div className={styles.tabs}>
              <a
                onClick={() => this.setState({ customMode: false, avatarId: "botdefault" })}
                className={classNames({ selected: this.state.customMode === false })}
              >
                Default
              </a>
              <a
                onClick={() => this.setState({ customMode: "id", avatarId: null })}
                className={classNames({ selected: this.state.customMode === "id" })}
              >
                Custom Skin
              </a>
              <a
                onClick={() => this.setState({ customMode: "url", avatarId: "" })}
                className={classNames({ selected: this.state.customMode === "url" })}
              >
                Custom Model
              </a>
            </div>

            {this.state.customMode ? (
              <div className={styles.avatarSelectorContainer}>
                {this.state.customMode === "url" ? (
                  <div>
                    <label htmlFor="#custom-avatar-url">Avatar GLTF/GLB </label>
                    <input
                      id="custom-avatar-url"
                      type="url"
                      required
                      className={styles.formFieldText}
                      value={this.state.avatarId}
                      onChange={e => this.setState({ avatarId: e.target.value })}
                    />
                    <div className={styles.links}>
                      <a onClick={() => this.setState({ customMode: false })}>cancel</a>
                    </div>
                  </div>
                ) : (
                  <AvatarEditor store={this.props.store} onAvatarChanged={avatarId => this.setState({ avatarId })} />
                )}
              </div>
            ) : (
              <div className={styles.avatarSelectorContainer}>
                <div className="loading-panel">
                  <div className="loader-wrap">
                    <div className="loader">
                      <div className="loader-center" />
                    </div>
                  </div>
                </div>
                <iframe
                  className={styles.avatarSelector}
                  src={`/avatar-selector.html`}
                  ref={ifr => {
                    if (this.avatarSelector === ifr) return;

                    this.avatarSelector = ifr;

                    if (this.avatarSelector) {
                      this.avatarSelector.onload = () => {
                        this.sendAvatarStateToIframe();
                      };
                    }
                  }}
                />
                <a
                  className="custom-url-link"
                  onClick={() =>
                    this.setState({ customMode: true, avatarId: avatars.find(a => a.id === this.state.avatarId).model })
                  }
                >
                  custom url
                </a>
              </div>
            )}
            <WithHoverSound>
              <input className={styles.formSubmit} type="submit" value={formatMessage({ id: "profile.save" })} />
            </WithHoverSound>
            <div className={styles.links}>
              <WithHoverSound>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/mozilla/hubs/blob/master/TERMS.md"
                >
                  <FormattedMessage id="profile.terms_of_use" />
                </a>
              </WithHoverSound>

              <WithHoverSound>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/mozilla/hubs/blob/master/PRIVACY.md"
                >
                  <FormattedMessage id="profile.privacy_notice" />
                </a>
              </WithHoverSound>
            </div>
          </div>
        </form>
        <img className={styles.logo} src={hubLogo} />
      </div>
    );
  }
}

export default injectIntl(ProfileEntryPanel);
