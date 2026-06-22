package com.example.backend.exception;

public enum ErrorCode {
    INVALID_CREDENTIALS("error.auth.invalid.credentials"),
    ACCOUNT_DISABLED("error.auth.account.disabled"),
    ACCOUNT_LOCKED("error.auth.account.locked"),
    REFRESH_TOKEN_INVALID("error.auth.refresh.token.invalid"),
    REFRESH_TOKEN_EXPIRED("error.auth.refresh.token.expired"),
    EMAIL_ALREADY_USED("error.user.email.already.used"),
    PPR_ALREADY_USED("error.user.ppr.already.used"),
    WRONG_CURRENT_PASSWORD("error.user.wrong.current.password"),
    CHEF_ALREADY_ASSIGNED("error.user.chef.already.assigned"),
    SIGNATAIRE_ALREADY_ASSIGNED("error.user.signataire.already.assigned"),
    SERVICE_NO_DIRECTION("error.user.service.no.direction"),
    INSUFFICIENT_BALANCE("error.demande.insufficient.balance"),
    OVERLAPPING_LEAVE("error.demande.overlapping"),
    NO_WORKING_DAYS("error.demande.no.working.days"),
    INTERIM_NOT_SAME_SERVICE("error.demande.interim.not.same.service"),
    INTERIM_ON_LEAVE("error.demande.interim.on.leave"),
    START_AFTER_END("error.demande.start.after.end"),
    NOT_DRAFT("error.demande.not.draft"),
    MALADIE_DOC_REQUIRED("error.demande.maladie.doc.required"),
    ALREADY_PROCESSED("error.demande.already.processed"),
    COMMENT_REQUIRED_REJECT("error.demande.comment.required.reject"),
    NOT_AUTHORIZED("error.demande.not.authorized"),
    CANNOT_MODIFY_PROCESSED("error.demande.cannot.modify.processed"),
    CANNOT_CANCEL_PROCESSED("error.demande.cannot.cancel.processed"),
    CAN_ONLY_CANCEL_OWN("error.demande.can.only.cancel.own"),
    ACTION_REFUSED("error.demande.action.refused"),
    FILE_EMPTY("error.demande.file.empty"),
    FILE_TOO_LARGE("error.demande.file.too.large"),
    FILE_FORMAT_NOT_ALLOWED("error.demande.file.format.not.allowed"),
    QUOTA_NOT_FOUND("error.demande.quota.not.found"),
    QUOTA_INSUFFICIENT("error.demande.quota.insufficient"),
    ANCIENNETE_INSUFFISANTE("error.demande.anciennete.insuffisante"),
    CODE_ALREADY_EXISTS("error.structure.code.already.exists"),
    HOLIDAY_ALREADY_EXISTS("error.holiday.already.exists"),
    USER_NOT_FOUND("error.user.not.found"),
    RESOURCE_NOT_FOUND("error.resource.not.found"),
    FILE_STORAGE_FAILED("error.file.storage.failed"),
    FILE_NOT_FOUND("error.file.not.found"),
    BUSINESS_ERROR("error.business.generic"),
    INTERNAL_ERROR("error.internal");

    private final String key;

    ErrorCode(String key) {
        this.key = key;
    }

    public String getKey() {
        return key;
    }
}
